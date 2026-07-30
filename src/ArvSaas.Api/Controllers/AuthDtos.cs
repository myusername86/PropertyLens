namespace ArvSaas.Api.Controllers;

public record RegisterRequest(
    string CompanyName,
    string Email,
    string Password,
    string DisplayName);

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset ExpiresAt,
    string DisplayName,
    string Role);