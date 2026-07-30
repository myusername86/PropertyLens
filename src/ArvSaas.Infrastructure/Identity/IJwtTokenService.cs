

namespace ArvSaas.Infrastructure.Identity;

public interface IJwtTokenService
{
    string CreateAccessToken(ApplicationUser user);
    (string Token, DateTimeOffset ExpiresAt) CreateRefreshToken();
}