using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Common.Interfaces;

/// <summary>
/// Application talks to persistence through this abstraction only.
/// The concrete DbContext (with tenant filters, auditing) lives in Infrastructure.
/// </summary>
public interface IAppDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<Deal> Deals { get; }
    DbSet<ComparableSale> ComparableSales { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
