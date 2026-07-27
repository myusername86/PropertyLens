using ArvSaas.Domain.Common;

namespace ArvSaas.Domain.Entities;

/// <summary>
/// A tenant-configured outbound webhook. When a subscribed domain event
/// occurs (e.g. a deal is approved), PropertyLens signs and POSTs a
/// payload to TargetUrl — this is the "send to Zapier" half of automation.
/// </summary>
public class WebhookSubscription : AuditableEntity, ITenantOwned
{
    public Guid TenantId { get; set; }

    public required string EventName { get; set; }   // e.g. "DealApproved"
    public required string TargetUrl { get; set; }
    public required string Secret { get; set; }        // used to HMAC-sign outgoing payloads
    public bool IsEnabled { get; set; } = true;

    public ICollection<AutomationLog> Logs { get; set; } = new List<AutomationLog>();
}