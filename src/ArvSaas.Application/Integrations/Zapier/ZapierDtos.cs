using ArvSaas.Domain.Entities;

namespace ArvSaas.Application.Integrations.Zapier;

public record WebhookSubscriptionDto(
    Guid Id,
    string EventName,
    string TargetUrl,
    string Secret,
    bool IsEnabled,
    DateTimeOffset CreatedAt)
{
    public static WebhookSubscriptionDto From(WebhookSubscription w) =>
        new(w.Id, w.EventName, w.TargetUrl, w.Secret, w.IsEnabled, w.CreatedAt);
}

public record AutomationLogDto(
    Guid Id,
    string EventName,
    string TargetUrl,
    int? StatusCode,
    bool Success,
    int RetryCount,
    long DurationMs,
    string? ErrorMessage,
    DateTimeOffset ExecutedAt)
{
    public static AutomationLogDto From(AutomationLog log) => new(
        log.Id, log.EventName, log.TargetUrl, log.StatusCode, log.Success,
        log.RetryCount, log.DurationMs, log.ErrorMessage, log.ExecutedAt);
}