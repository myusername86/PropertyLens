using ArvSaas.Application.Integrations.Zapier.Commands;
using ArvSaas.Application.Integrations.Zapier.Queries;
using ArvSaas.Application.Integrations.Zapier;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArvSaas.Api.Controllers;

/// <summary>
/// Manages outbound webhook subscriptions and exposes delivery history
/// for the Zapier integration module. Admin-only, matching the Billing
/// controller's gating pattern.
/// </summary>
[ApiController]
[Route("api/integrations/zapier")]
[Authorize(Roles = "Admin")]
public class ZapierController(ISender mediator) : ControllerBase
{
    public record CreateWebhookRequest(string EventName, string TargetUrl);

    [HttpGet("webhooks")]
    public async Task<ActionResult<IReadOnlyList<WebhookSubscriptionDto>>> GetWebhooks(CancellationToken ct)
        => Ok(await mediator.Send(new GetWebhooksQuery(), ct));

    [HttpPost("webhooks")]
    public async Task<ActionResult<WebhookSubscriptionDto>> CreateWebhook(
        [FromBody] CreateWebhookRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateWebhookCommand(request.EventName, request.TargetUrl), ct);
        return result.IsSuccess ? Ok(result.Value) : UnprocessableEntity(new { error = result.Error });
    }

    [HttpDelete("webhooks/{id:guid}")]
    public async Task<IActionResult> DeleteWebhook(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteWebhookCommand(id), ct);
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }

    [HttpGet("logs")]
    public async Task<ActionResult<IReadOnlyList<AutomationLogDto>>> GetLogs(CancellationToken ct)
        => Ok(await mediator.Send(new GetAutomationLogsQuery(), ct));
}