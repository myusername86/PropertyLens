using ArvSaas.Domain.Common;

namespace ArvSaas.Domain.Entities;

/// <summary>
/// One row per webhook delivery attempt. This is what makes "Activity Logs"
/// real data instead of decorative UI — every send, success or failure,
/// is recorded here.
/// </summary>
public class AutomationLog : BaseEntity, ITenantOwned
{
    public Guid TenantId { get; set; }

    public Guid WebhookSubscriptionId { get; set; }
    public WebhookSubscription? WebhookSubscription { get; set; }

    public required string EventName { get; set; }
    public required string TargetUrl { get; set; }
    public int? StatusCode { get; set; }
    public bool Success { get; set; }
    public int RetryCount { get; set; }
    public long DurationMs { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset ExecutedAt { get; set; } = DateTimeOffset.UtcNow;
}