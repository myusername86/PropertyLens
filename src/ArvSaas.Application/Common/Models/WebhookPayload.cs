namespace ArvSaas.Application.Common.Models;
public record WebhookPayload(string Event, DateTimeOffset OccurredAt, object Data);