using Microsoft.EntityFrameworkCore;
using SecureVault.Core.Entities;

namespace SecureVault.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<VaultItem> VaultItems { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
        });

        modelBuilder.Entity<VaultItem>(entity =>
        {
            entity.HasOne(v => v.User)
                  .WithMany(u => u.VaultItems)
                  .HasForeignKey(v => v.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasIndex(v => v.UserId);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(a => a.User)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasIndex(a => a.UserId);
        });
    }
}
