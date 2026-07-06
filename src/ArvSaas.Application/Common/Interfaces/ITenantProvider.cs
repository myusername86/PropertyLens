namespace ArvSaas.Application.Common.Interfaces;

/// <summary>Resolves the current tenant from the authenticated request (JWT claim).</summary>
public interface ITenantProvider
{
    Guid TenantId { get; }
    bool HasTenant { get; }
}

public interface ICurrentUser
{
    string? UserId { get; }
    string? Email { get; }
}
