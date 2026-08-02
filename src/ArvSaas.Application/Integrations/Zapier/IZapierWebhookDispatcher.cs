namespace ArvSaas.Application.Integrations.Zapier;
public interface IZapierWebhookDispatcher
{
    Task DispatchAsync(Guid tenantId, string eventName, object payload, CancellationToken ct = default);
}