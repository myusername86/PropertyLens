using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArvSaas.Api.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize]
public class BillingController(IBillingService billing, ITenantProvider tenant) : ControllerBase
{
    public record CheckoutRequest(SubscriptionPlan Plan, BillingInterval Interval);
    public record RedirectResponse(string Url);

    /// <summary>Starts a Stripe-hosted checkout; frontend redirects to the returned URL.</summary>
    [HttpPost("checkout")]
    public async Task<ActionResult<RedirectResponse>> CreateCheckout(
        [FromBody] CheckoutRequest request, CancellationToken ct)
    {
        if (request.Plan == SubscriptionPlan.Free)
        {
            return UnprocessableEntity(new { error = "The Free plan does not require checkout." });
        }

        var url = await billing.CreateCheckoutSessionUrlAsync(
            tenant.TenantId, request.Plan, request.Interval, ct);
        return Ok(new RedirectResponse(url));
    }

    /// <summary>Opens the Stripe customer portal for managing the subscription.</summary>
    [HttpPost("portal")]
    public async Task<ActionResult<RedirectResponse>> CreatePortal(CancellationToken ct)
    {
        var url = await billing.CreatePortalSessionUrlAsync(tenant.TenantId, ct);
        return Ok(new RedirectResponse(url));
    }
}