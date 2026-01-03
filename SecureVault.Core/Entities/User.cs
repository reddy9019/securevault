using System;
using System.Collections.Generic;

namespace SecureVault.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // Argon2id hash for authentication
    
    // Salt used for client-side Master Key derivation. 
    // This is public information (retrieved by client before login).
    public string KeySalt { get; set; } = string.Empty; 
    
    // Salt used for client-side Auth Hash generation.
    public string AuthSalt { get; set; } = string.Empty; 
    
    public string? MfaSecret { get; set; }
    public bool MfaEnabled { get; set; }
    
    // Envelope Encryption: 
    // MasterKey is RANDOM. Stored encrypted by the Key derived from Password.
    public string EncryptedMasterKey { get; set; } = string.Empty;
    public string EncryptedMasterKeyIV { get; set; } = string.Empty;

    public string RecoveryKeyHash { get; set; } = string.Empty; // Backup access

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VaultItem> VaultItems { get; set; } = new List<VaultItem>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
