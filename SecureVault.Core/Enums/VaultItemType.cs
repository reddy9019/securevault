namespace SecureVault.Core.Enums;

public enum VaultItemType
{
    Login,
    Note,
    CreditCard,
    Identity,
    Sftp,      // FTP, SCPL, SFTP
    Smtp,      // Email Server
    ApiKey,    // API Tokens
    Database,  // DB Connections
    SshKey,    // SSH Credentials
    AppSecret  // Client ID/Secrets
}
