namespace ArvSaas.Domain.Enums;

public enum DealStage
{
    New = 0,
    Analyzing = 1,
    Approved = 2,
    Rejected = 3
}

public enum RiskLevel
{
    Unknown = 0,
    Low = 1,
    Medium = 2,
    High = 3
}

public enum SubscriptionPlan
{
    Free = 0,
    Pro = 1,
    Enterprise = 2
}

public enum SubscriptionStatus
{
    Inactive = 0,
    Active = 1,
    PastDue = 2,
    Canceled = 3
}
