using SecureVault.Core.Enums;

namespace SecureVault.Core.DTOs;

public class CreateVaultItemDto
{
    public required string Name { get; set; }
    public required string EncryptedValue { get; set; }
    public VaultItemType Type { get; set; } = VaultItemType.Login;
    public string Category { get; set; } = "General"; // Project Name
}
