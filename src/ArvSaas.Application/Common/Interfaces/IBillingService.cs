using ArvSaas.Domain.Enums;

namespace ArvSaas.Application.Common.Interfaces;

/// <summary>
/// Payment provider abstraction. The Application layer knows about
/// "checkout" and "portal" as concepts — Stripe specifics live in
/// Infrastructure, swappable and mockable in tests.
/// </summary>
public interface IBillingService
{
    /// <summary>Creates a hosted checkout session; returns the URL to redirect the user to.</summary>
    Task<string> CreateCheckoutSessionUrlAsync(
        Guid tenantId, SubscriptionPlan plan, BillingInterval interval, CancellationToken ct = default);

    /// <summary>Creates a hosted billing-portal session for an existing customer.</summary>
    Task<string> CreatePortalSessionUrlAsync(Guid tenantId, CancellationToken ct = default);
}

public enum BillingInterval
{
    Monthly = 0,
    Yearly = 1
}