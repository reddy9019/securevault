using System;
using System.ComponentModel.DataAnnotations;

namespace SecureVault.Core.DTOs;

public class PreLoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class PreLoginResponse
{
    public string AuthSalt { get; set; } = string.Empty;
    public string KeySalt { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string AuthHash { get; set; } = string.Empty; // Client computed

    public string? MfaToken { get; set; }
}

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string AuthHash { get; set; } = string.Empty;

    [Required]
    public string AuthSalt { get; set; } = string.Empty;

    [Required]
    public string KeySalt { get; set; } = string.Empty;

    [Required]
    public string EncryptedMasterKey { get; set; } = string.Empty;

    [Required]
    public string EncryptedMasterKeyIV { get; set; } = string.Empty;

    [Required]
    public string RecoveryKeyHash { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty; // JWT
    public string RefreshToken { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string KeySalt { get; set; } = string.Empty;
    public string EncryptedMasterKey { get; set; } = string.Empty;
    public string EncryptedMasterKeyIV { get; set; } = string.Empty;
}
