using System.Security.Claims;
using ArvSaas.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ArvSaas.Infrastructure.Tenancy;

/// <summary>
/// Resolves the tenant from the authenticated user's JWT.
/// The claim is stamped onto the token at signup (extension attribute
/// in Entra External ID, or app-managed mapping table).
/// </summary>
public class HttpTenantProvider(IHttpContextAccessor accessor) : ITenantProvider, ICurrentUser
{
    public const string TenantClaim = "extension_TenantId";

    public Guid TenantId =>
        Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(TenantClaim), out var id)
            ? id
            : throw new UnauthorizedAccessException("No tenant claim present on the request.");

    public bool HasTenant =>
        Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(TenantClaim), out _);

    public string? UserId =>
        accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? accessor.HttpContext?.User.FindFirstValue("oid");

    public string? Email =>
        accessor.HttpContext?.User.FindFirstValue("emails")
        ?? accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
}
