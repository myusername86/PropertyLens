using ArvSaas.Domain.Common;
using ArvSaas.Domain.Enums;

namespace ArvSaas.Domain.Entities;

/// <summary>
/// A tenant is an organization (investor firm or solo investor account).
/// All business data hangs off a tenant.
/// </summary>
public class Tenant : AuditableEntity
{
    public required string Name { get; set; }
    public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free;
    public SubscriptionStatus SubscriptionStatus { get; set; } = SubscriptionStatus.Inactive;
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }

    public ICollection<Deal> Deals { get; set; } = new List<Deal>();

    /// <summary>Feature gating lives on the domain, not scattered across controllers.</summary>
    public int MaxActiveDeals => Plan switch
    {
        SubscriptionPlan.Free => 5,
        SubscriptionPlan.Pro => 100,
        SubscriptionPlan.Enterprise => int.MaxValue,
        _ => 5
    };

    public bool CanUseAiAnalysis => Plan is SubscriptionPlan.Pro or SubscriptionPlan.Enterprise
                                    && SubscriptionStatus == SubscriptionStatus.Active;
}
