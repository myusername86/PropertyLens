using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;

namespace ArvSaas.Infrastructure.Billing;

/// <summary>
/// Translates Stripe webhook events into tenant subscription state.
/// Handlers are idempotent by design: applying the same event twice
/// results in the same state, so Stripe's occasional duplicate
/// deliveries are harmless.
/// </summary>
public sealed class StripeWebhookProcessor(
    IAppDbContext db,
    IOptions<StripeOptions> options,
    ILogger<StripeWebhookProcessor> logger)
{
    private readonly StripeOptions _options = options.Value;

    public async Task ProcessAsync(Event stripeEvent, CancellationToken ct = default)
    {
        switch (stripeEvent.Type)
        {
            // Sent when a subscription is created, renewed, upgraded,
            // downgraded, or its payment status changes.
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await ApplySubscriptionAsync((Subscription)stripeEvent.Data.Object, ct);
                break;

            case "customer.subscription.deleted":
                await RemoveSubscriptionAsync((Subscription)stripeEvent.Data.Object, ct);
                break;

            default:
                logger.LogDebug("Ignoring unhandled Stripe event type {EventType}", stripeEvent.Type);
                break;
        }
    }

    private async Task ApplySubscriptionAsync(Subscription subscription, CancellationToken ct)
    {
        var tenant = await FindTenantAsync(subscription, ct);
        if (tenant is null)
        {
            logger.LogWarning(
                "Received subscription event for unknown tenant. Customer: {CustomerId}",
                subscription.CustomerId);
            return;
        }

        var priceId = subscription.Items.Data.FirstOrDefault()?.Price?.Id;
        tenant.Plan = ResolvePlan(priceId);
        tenant.SubscriptionStatus = MapStatus(subscription.Status);
        tenant.StripeSubscriptionId = subscription.Id;
        tenant.StripeCustomerId ??= subscription.CustomerId;

        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "Tenant {TenantId} synced to plan {Plan} with status {Status}",
            tenant.Id, tenant.Plan, tenant.SubscriptionStatus);
    }

    private async Task RemoveSubscriptionAsync(Subscription subscription, CancellationToken ct)
    {
        var tenant = await FindTenantAsync(subscription, ct);
        if (tenant is null)
        {
            return;
        }

        tenant.Plan = SubscriptionPlan.Free;
        tenant.SubscriptionStatus = SubscriptionStatus.Canceled;
        tenant.StripeSubscriptionId = null;

        await db.SaveChangesAsync(ct);

        logger.LogInformation("Tenant {TenantId} downgraded to Free (subscription ended)", tenant.Id);
    }

    /// <summary>
    /// Tenant resolution: metadata first (we stamp tenantId at checkout),
    /// customer id as fallback for events created outside our checkout flow.
    /// </summary>
    private async Task<Tenant?> FindTenantAsync(Subscription subscription, CancellationToken ct)
    {
        if (subscription.Metadata.TryGetValue("tenantId", out var raw)
            && Guid.TryParse(raw, out var tenantId))
        {
            var byId = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, ct);
            if (byId is not null)
            {
                return byId;
            }
        }

        return await db.Tenants.FirstOrDefaultAsync(
            t => t.StripeCustomerId == subscription.CustomerId, ct);
    }

    private SubscriptionPlan ResolvePlan(string? priceId)
    {
        if (priceId == _options.ProMonthlyPriceId || priceId == _options.ProYearlyPriceId)
        {
            return SubscriptionPlan.Pro;
        }

        if (priceId == _options.EnterpriseMonthlyPriceId || priceId == _options.EnterpriseYearlyPriceId)
        {
            return SubscriptionPlan.Enterprise;
        }

        logger.LogWarning("Unknown price id {PriceId}; defaulting to Free", priceId);
        return SubscriptionPlan.Free;
    }

    private static SubscriptionStatus MapStatus(string stripeStatus) => stripeStatus switch
    {
        "active" or "trialing" => SubscriptionStatus.Active,
        "past_due" or "unpaid" => SubscriptionStatus.PastDue,
        "canceled" or "incomplete_expired" => SubscriptionStatus.Canceled,
        _ => SubscriptionStatus.Inactive
    };
}