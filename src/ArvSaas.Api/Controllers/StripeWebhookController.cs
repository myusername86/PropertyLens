using ArvSaas.Infrastructure.Billing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

namespace ArvSaas.Api.Controllers;

/// <summary>
/// Receives Stripe webhook events. Anonymous by necessity (Stripe cannot
/// hold one of our JWTs) — authenticity is guaranteed instead by verifying
/// Stripe's cryptographic signature on every request. Requests that fail
/// verification are rejected before any processing.
/// </summary>
[ApiController]
[Route("api/webhooks/stripe")]
[AllowAnonymous]
public class StripeWebhookController(
    StripeWebhookProcessor processor,
    IOptions<StripeOptions> options,
    ILogger<StripeWebhookController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        var payload = await new StreamReader(Request.Body).ReadToEndAsync(ct);

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                payload,
                Request.Headers["Stripe-Signature"],
                options.Value.WebhookSecret,
                throwOnApiVersionMismatch: false);
        }
        catch (StripeException ex)
        {
            logger.LogWarning(ex, "Rejected webhook with invalid signature");
            return BadRequest();
        }

        await processor.ProcessAsync(stripeEvent, ct);

        // Always 200 for verified events — even unhandled types —
        // so Stripe doesn't retry them forever.
        return Ok();
    }
}