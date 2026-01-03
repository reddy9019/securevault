using SecureVault.Core.DTOs;
using SecureVault.Core.Entities;

namespace SecureVault.Core.Interfaces;

public interface IVaultService
{
    Task<IEnumerable<VaultItem>> GetUserVaultItemsAsync(Guid userId);
    Task<VaultItem?> GetVaultItemAsync(Guid id, Guid userId);
    Task<VaultItem> CreateVaultItemAsync(Guid userId, CreateVaultItemDto dto);
    Task<bool> DeleteVaultItemAsync(Guid id, Guid userId);
}
