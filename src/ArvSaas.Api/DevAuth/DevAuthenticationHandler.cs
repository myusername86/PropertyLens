using System.Security.Claims;
using System.Text.Encodings.Web;
using ArvSaas.Infrastructure.Tenancy;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace ArvSaas.Api.DevAuth;

public sealed class DevAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "DevAuth";

    /// <summary>Fixed ID so the seeded tenant and the claim always match.</summary>
    public static readonly Guid DevTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Local dev only: pick a role via ?role=Analyst|Investor|Admin to
        // exercise authorization policies without a real Entra tenant.
        var requestedRole = Request.Query["role"].ToString();
        var role = requestedRole is "Analyst" or "Investor" or "Admin"
            ? requestedRole
            : "Admin";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "dev-user-001"),
            new Claim(ClaimTypes.Name, "Local Dev User"),
            new Claim(ClaimTypes.Email, "dev@local.test"),
            new Claim(ClaimTypes.Role, role),
            new Claim(HttpTenantProvider.TenantClaim, DevTenantId.ToString())
        };

        var identity = new ClaimsIdentity(claims, SchemeName, ClaimTypes.Name, ClaimTypes.Role);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}