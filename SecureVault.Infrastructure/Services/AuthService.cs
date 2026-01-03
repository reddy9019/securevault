using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Isopoh.Cryptography.Argon2;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SecureVault.Core.DTOs;
using SecureVault.Core.Entities;
using SecureVault.Core.Interfaces;
using SecureVault.Infrastructure.Data;

namespace SecureVault.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<PreLoginResponse?> PreLoginAsync(PreLoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return null;

        return new PreLoginResponse
        {
            AuthSalt = user.AuthSalt,
            KeySalt = user.KeySalt
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("User already exists.");
        }

        // Server-side hashing of the client-provided AuthHash
        // We use Argon2id on the server as well to protect against DB leaks.
        var serverHash = Argon2.Hash(request.AuthHash);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = serverHash,
            AuthSalt = request.AuthSalt,
            KeySalt = request.KeySalt,
            EncryptedMasterKey = request.EncryptedMasterKey,
            EncryptedMasterKeyIV = request.EncryptedMasterKeyIV,
            RecoveryKeyHash = request.RecoveryKeyHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(), // TODO: Implement real refresh token logic
            UserId = user.Id,
            Email = user.Email,
            KeySalt = user.KeySalt,
            EncryptedMasterKey = user.EncryptedMasterKey,
            EncryptedMasterKeyIV = user.EncryptedMasterKeyIV
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return null;

        // Verify the AuthHash provided by client against the stored hash
        if (!Argon2.Verify(user.PasswordHash, request.AuthHash))
        {
            return null;
        }

        // TODO: Verify MFA if enabled
        if (user.MfaEnabled)
        {
             // Verify request.MfaToken
             // if (invalid) return null;
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Email = user.Email,
            KeySalt = user.KeySalt,
            EncryptedMasterKey = user.EncryptedMasterKey,
            EncryptedMasterKeyIV = user.EncryptedMasterKeyIV
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyThatShouldBeLongEnough123456789"; 
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"] ?? "SecureVault",
            audience: jwtSettings["Audience"] ?? "SecureVaultClient",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60), // TODO: Configurable
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
