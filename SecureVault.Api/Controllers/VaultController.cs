using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecureVault.Core.DTOs;
using SecureVault.Core.Interfaces;

namespace SecureVault.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VaultController : ControllerBase
{
    private readonly IVaultService _vaultService;

    public VaultController(IVaultService vaultService)
    {
        _vaultService = vaultService;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var paramsId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (paramsId == null) return Unauthorized();

        if (!Guid.TryParse(paramsId, out var userId)) 
            return BadRequest("Invalid User ID in token.");

        var items = await _vaultService.GetUserVaultItemsAsync(userId);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetItem(Guid id)
    {
        var paramsId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (paramsId == null) return Unauthorized();

        if (!Guid.TryParse(paramsId, out var userId)) 
            return BadRequest("Invalid User ID in token.");

        var item = await _vaultService.GetVaultItemAsync(id, userId);
        if (item == null) return NotFound();

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] CreateVaultItemDto dto)
    {
        var paramsId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (paramsId == null) return Unauthorized();

        if (!Guid.TryParse(paramsId, out var userId)) 
            return BadRequest("Invalid User ID in token.");

        var item = await _vaultService.CreateVaultItemAsync(userId, dto);
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var paramsId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (paramsId == null) return Unauthorized();

        if (!Guid.TryParse(paramsId, out var userId)) 
            return BadRequest("Invalid User ID in token.");

        var result = await _vaultService.DeleteVaultItemAsync(id, userId);
        
        if (!result) return NotFound();
        
        return NoContent();
    }
}
