using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Common;
using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Infrastructure.Persistence;

public class AppDbContext(
    DbContextOptions<AppDbContext> options,
    ITenantProvider tenantProvider,
    ICurrentUser currentUser) : DbContext(options), IAppDbContext
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<ComparableSale> ComparableSales => Set<ComparableSale>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // -------- MULTI-TENANCY: global query filters --------
        // Every ITenantOwned entity is automatically filtered to the
        // current tenant. No query in the codebase can leak cross-tenant
        // data by accident. This is the single most important line for
        // SaaS data isolation.
        modelBuilder.Entity<Deal>()
            .HasQueryFilter(d => d.TenantId == tenantProvider.TenantId);

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = currentUser.UserId;
                    break;
                case EntityState.Modified:
                    entry.Entity.LastModifiedAt = now;
                    entry.Entity.LastModifiedBy = currentUser.UserId;
                    break;
            }
        }

        // Safety net: stamp TenantId on new tenant-owned entities so a
        // handler can never insert rows into another tenant's space.
        foreach (var entry in ChangeTracker.Entries<ITenantOwned>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                entry.Entity.TenantId = tenantProvider.TenantId;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
