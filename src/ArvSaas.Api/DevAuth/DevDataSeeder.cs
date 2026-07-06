using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;
using ArvSaas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Api.DevAuth;

/// <summary>
/// Ensures the dev tenant row exists so tenant-scoped handlers work
/// out of the box locally. Pro plan + Active so nothing is gated.
/// </summary>
public static class DevDataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var exists = await db.Tenants.AnyAsync(t => t.Id == DevAuthenticationHandler.DevTenantId);
        if (exists)
        {
            return;
        }

        db.Tenants.Add(new Tenant
        {
            Id = DevAuthenticationHandler.DevTenantId,
            Name = "Dev Tenant",
            Plan = SubscriptionPlan.Pro,
            SubscriptionStatus = SubscriptionStatus.Active
        });

        await db.SaveChangesAsync();
    }
}