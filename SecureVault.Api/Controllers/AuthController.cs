using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SecureVault.Core.DTOs;
using SecureVault.Core.Interfaces;

namespace SecureVault.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("prelogin")]
    public async Task<ActionResult<PreLoginResponse>> PreLogin(PreLoginRequest request)
    {
        var result = await _authService.PreLoginAsync(request);
        if (result == null)
            return NotFound(new { message = "User not found" }); // In prod be careful with enumeration, but here we need salts.

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (System.Exception ex)
        {
             return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Invalid credentials" });

        return Ok(result);
    }
}
