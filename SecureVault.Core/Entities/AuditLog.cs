using System;

namespace SecureVault.Core.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Action { get; set; } = string.Empty; // e.g., "Create", "Update", "View", "Delete", "Login"
    public string Resource { get; set; } = string.Empty; // e.g., "VaultItem:ID" or "Settings"
    
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
