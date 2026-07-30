using ArvSaas.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArvSaas.Infrastructure.Identity;

/// <summary>
/// Extends ASP.NET Identity's IdentityUser with PropertyLens-specific
/// fields. IdentityUser already provides Email, PasswordHash, security
/// stamps, and lockout tracking — we only add what our multi-tenant
/// domain needs on top of that.
///
/// Lives in Infrastructure, not Domain: IdentityUser is a framework
/// concern (ASP.NET Identity), and Domain must stay free of framework
/// dependencies per Clean Architecture's dependency rule.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public required Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    /// <summary>
    /// Analyst / Investor / Admin — written into the JWT as a role claim
    /// on login. Kept as a simple string column rather than full ASP.NET
    /// Identity Roles tables, since our authorization only ever checks
    /// this one claim (see [Authorize(Roles = "...")] on controllers).
    /// </summary>
    public required string Role { get; set; }

    public required string DisplayName { get; set; }
}