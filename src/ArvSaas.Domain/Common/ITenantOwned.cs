namespace ArvSaas.Domain.Common;

/// <summary>
/// Marker interface for entities that belong to a tenant.
/// Infrastructure applies a global EF Core query filter to every entity
/// implementing this, so tenant isolation is enforced centrally and
/// cannot be forgotten in individual queries.
/// </summary>
public interface ITenantOwned
{
    Guid TenantId { get; set; }
}
