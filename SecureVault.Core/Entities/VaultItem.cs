using System;
using SecureVault.Core.Enums;

namespace SecureVault.Core.Entities;

public class VaultItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public VaultItemType Type { get; set; }
    
    // Encrypted Content
    // Stored as Base64 strings.
    // The client decrypts EncryptedItemKey using MasterKey.
    // Then uses ItemKey to decrypt CipherText.
    public string EncryptedItemKey { get; set; } = string.Empty; 
    public string ItemKeyIV { get; set; } = string.Empty; // IV used for EncryptedItemKey
    
    public string CipherText { get; set; } = string.Empty; // AES-256-GCM payload
    public string IV { get; set; } = string.Empty; // 12 bytes IV
    public string AuthTag { get; set; } = string.Empty; // 16 bytes Tag (sometimes appended to ciphertext)

    // Unencrypted Metadata for filtering/searching
    // Be careful not to leak sensitive info here.
    public string MetaTitle { get; set; } = string.Empty; 
    public string? MetaUsername { get; set; }
    public string? MetaUrl { get; set; }
    public string Category { get; set; } = "General"; // Used for Project Grouping
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
