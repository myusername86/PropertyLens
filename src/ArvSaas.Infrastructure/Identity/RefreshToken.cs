namespace ArvSaas.Infrastructure.Identity;

/// <summary>
/// Server-side record of an issued refresh token, so it can be validated
/// and revoked. Never store the raw token — only its hash — so a
/// database leak alone can't be used to mint new access tokens.
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required Guid UserId { get; set; }
    public required string TokenHash { get; set; }
    public required DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}