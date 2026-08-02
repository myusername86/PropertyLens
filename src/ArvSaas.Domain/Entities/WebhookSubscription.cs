using ArvSaas.Domain.Common;

namespace ArvSaas.Domain.Entities;

public class WebhookSubscription : AuditableEntity, ITenantOwned
{
    public Guid TenantId { get; set; }

    public required string EventName { get; set; }
    public required string TargetUrl { get; set; }
    public required string Secret { get; set; }
    public bool IsEnabled { get; set; } = true;

    public ICollection<AutomationLog> Logs { get; set; } = new List<AutomationLog>();
}