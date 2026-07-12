using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace ArvSaas.Infrastructure.Billing;

public sealed class StripeBillingService(
    IAppDbContext db,
    IOptions<StripeOptions> options) : IBillingService
{
    private readonly StripeOptions _options = options.Value;

    public async Task<string> CreateCheckoutSessionUrlAsync(
        Guid tenantId, SubscriptionPlan plan, BillingInterval interval, CancellationToken ct = default)
    {
        var tenant = await db.Tenants.FirstAsync(t => t.Id == tenantId, ct);
        var customerId = await EnsureStripeCustomerAsync(tenant, ct);

        var sessionOptions = new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "subscription",
            LineItems =
            [
                new SessionLineItemOptions { Price = ResolvePriceId(plan, interval), Quantity = 1 }
            ],
            SuccessUrl = _options.SuccessUrl,
            CancelUrl = _options.CancelUrl,
            // Travels through Stripe and comes back in webhook events —
            // how we know which tenant a payment belongs to.
            Metadata = new Dictionary<string, string> { ["tenantId"] = tenant.Id.ToString() },
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string> { ["tenantId"] = tenant.Id.ToString() }
            }
        };

        var session = await new SessionService().CreateAsync(sessionOptions, cancellationToken: ct);
        return session.Url;
    }

    public async Task<string> CreatePortalSessionUrlAsync(Guid tenantId, CancellationToken ct = default)
    {
        var tenant = await db.Tenants.FirstAsync(t => t.Id == tenantId, ct);

        if (string.IsNullOrEmpty(tenant.StripeCustomerId))
        {
            throw new InvalidOperationException(
                "Tenant has no billing account yet. Complete a checkout first.");
        }

        var session = await new Stripe.BillingPortal.SessionService().CreateAsync(
            new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = tenant.StripeCustomerId,
                ReturnUrl = _options.CancelUrl
            },
            cancellationToken: ct);

        return session.Url;
    }

    /// <summary>Creates the Stripe customer on first use and persists its id on the tenant.</summary>
    private async Task<string> EnsureStripeCustomerAsync(Tenant tenant, CancellationToken ct)
    {
        if (!string.IsNullOrEmpty(tenant.StripeCustomerId))
        {
            return tenant.StripeCustomerId;
        }

        var customer = await new CustomerService().CreateAsync(
            new CustomerCreateOptions
            {
                Name = tenant.Name,
                Metadata = new Dictionary<string, string> { ["tenantId"] = tenant.Id.ToString() }
            },
            cancellationToken: ct);

        tenant.StripeCustomerId = customer.Id;
        await db.SaveChangesAsync(ct);
        return customer.Id;
    }

    private string ResolvePriceId(SubscriptionPlan plan, BillingInterval interval) =>
        (plan, interval) switch
        {
            (SubscriptionPlan.Pro, BillingInterval.Monthly) => _options.ProMonthlyPriceId,
            (SubscriptionPlan.Pro, BillingInterval.Yearly) => _options.ProYearlyPriceId,
            (SubscriptionPlan.Enterprise, BillingInterval.Monthly) => _options.EnterpriseMonthlyPriceId,
            (SubscriptionPlan.Enterprise, BillingInterval.Yearly) => _options.EnterpriseYearlyPriceId,
            _ => throw new ArgumentException($"No price configured for {plan}/{interval}.")
        };
}