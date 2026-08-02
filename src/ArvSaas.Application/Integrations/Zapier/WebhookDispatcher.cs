using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using ArvSaas.Application.Integrations.Zapier;
using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ArvSaas.Infrastructure.Integrations.Zapier;

/// <summary>
/// Sends signed outbound webhooks and logs every delivery attempt.
/// This is the only class in the entire solution that knows how to
/// actually talk HTTP to a subscriber — everything upstream of this
/// (the event handler, the domain event) only knows "something
/// happened," never how it gets delivered.
/// </summary>
public sealed class WebhookDispatcher(
    HttpClient httpClient,
    IAppDbContext db,
    ILogger<WebhookDispatcher> logger) : IZapierWebhookDispatcher
{
    private const int MaxAttempts = 2;

    public async Task DispatchAsync(Guid tenantId, string eventName, object payload, CancellationToken ct = default)
    {
        List<WebhookSubscription> subscriptions;
        try
        {
            subscriptions = await db.WebhookSubscriptions
                .Where(w => w.TenantId == tenantId && w.EventName == eventName && w.IsEnabled)
                .ToListAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load webhook subscriptions for {Event}", eventName);
            return;
        }

        if (subscriptions.Count == 0)
        {
            return;
        }

        var envelope = new WebhookPayload(eventName, DateTimeOffset.UtcNow, payload);
        var json = JsonSerializer.Serialize(envelope);

        foreach (var subscription in subscriptions)
        {
            await SendWithRetryAsync(subscription, eventName, json, ct);
        }
    }

    private async Task SendWithRetryAsync(
        WebhookSubscription subscription, string eventName, string json, CancellationToken ct)
    {
        var attempt = 0;
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        while (attempt < MaxAttempts)
        {
            attempt++;
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, subscription.TargetUrl)
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };
                request.Headers.Add("X-PropertyLens-Signature", Sign(json, subscription.Secret));

                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
                timeout.CancelAfter(TimeSpan.FromSeconds(10));

                var response = await httpClient.SendAsync(request, timeout.Token);
                stopwatch.Stop();

                await LogAttemptAsync(
                    subscription, eventName,
                    statusCode: (int)response.StatusCode,
                    success: response.IsSuccessStatusCode,
                    retryCount: attempt - 1,
                    durationMs: stopwatch.ElapsedMilliseconds,
                    errorMessage: response.IsSuccessStatusCode ? null : $"HTTP {(int)response.StatusCode}",
                    ct);

                if (response.IsSuccessStatusCode)
                {
                    return;
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                await LogAttemptAsync(
                    subscription, eventName,
                    statusCode: null,
                    success: false,
                    retryCount: attempt - 1,
                    durationMs: stopwatch.ElapsedMilliseconds,
                    errorMessage: ex.Message,
                    ct);
            }
        }
    }

    private async Task LogAttemptAsync(
        WebhookSubscription subscription,
        string eventName,
        int? statusCode,
        bool success,
        int retryCount,
        long durationMs,
        string? errorMessage,
        CancellationToken ct)
    {
        try
        {
            db.AutomationLogs.Add(new AutomationLog
            {
                TenantId = subscription.TenantId,
                WebhookSubscriptionId = subscription.Id,
                EventName = eventName,
                TargetUrl = subscription.TargetUrl,
                StatusCode = statusCode,
                Success = success,
                RetryCount = retryCount,
                DurationMs = durationMs,
                ErrorMessage = errorMessage
            });
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to write automation log for {Event}", eventName);
        }
    }

    private static string Sign(string payload, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}