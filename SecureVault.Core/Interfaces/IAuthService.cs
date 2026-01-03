using System.Threading.Tasks;
using SecureVault.Core.DTOs;
using SecureVault.Core.Entities;

namespace SecureVault.Core.Interfaces;

public interface IAuthService
{
    Task<PreLoginResponse?> PreLoginAsync(PreLoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
