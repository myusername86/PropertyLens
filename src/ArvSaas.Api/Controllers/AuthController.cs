using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ArvSaas.Domain.Entities;
using ArvSaas.Infrastructure.Identity;
using ArvSaas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    AppDbContext db,
    IJwtTokenService tokenService) : ControllerBase
{
    /// <summary>
    /// Self-registration. The first user for a new company creates the
    /// Tenant and becomes its Admin — the standard SaaS onboarding
    /// pattern (same as Slack, Notion, Linear).
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request, CancellationToken ct)
    {
        var tenant = new Tenant { Name = request.CompanyName };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync(ct);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email,
            TenantId = tenant.Id,
            Role = "Admin",
            DisplayName = request.DisplayName
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return UnprocessableEntity(new { error = errors });
        }

        return Ok(await IssueTokensAsync(user, ct));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        // Deliberately generic message either way — never reveal whether
        // the email exists, to prevent user enumeration.
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        return Ok(await IssueTokensAsync(user, ct));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(
        [FromBody] RefreshRequest request, CancellationToken ct)
    {
        var tokenHash = Hash(request.RefreshToken);
        var stored = await db.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (stored is null || !stored.IsActive)
        {
            return Unauthorized(new { error = "Invalid or expired refresh token." });
        }

        var user = await userManager.FindByIdAsync(stored.UserId.ToString());
        if (user is null)
        {
            return Unauthorized(new { error = "User not found." });
        }

        // Rotate: revoke the old refresh token, issue a new pair.
        stored.RevokedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return Ok(await IssueTokensAsync(user, ct));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userManager.FindByIdAsync(userId!);
        if (user is null)
        {
            return Unauthorized();
        }

        var result = await userManager.ChangePasswordAsync(
            user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return UnprocessableEntity(new { error = errors });
        }

        return NoContent();
    }

    /// <summary>
    /// Client-side logout is sufficient at this scope: the frontend
    /// discards its stored tokens. We additionally revoke the refresh
    /// token server-side so it can't be replayed even if leaked.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshRequest request, CancellationToken ct)
    {
        var tokenHash = Hash(request.RefreshToken);
        var stored = await db.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (stored is not null)
        {
            stored.RevokedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, CancellationToken ct)
    {
        var accessToken = tokenService.CreateAccessToken(user);
        var (refreshToken, expiresAt) = tokenService.CreateRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(refreshToken),
            ExpiresAt = expiresAt
        });
        await db.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshToken, expiresAt, user.DisplayName, user.Role);
    }

    private static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToBase64String(bytes);
    }
}