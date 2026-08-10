namespace ArvSaas.Application.Common.Interfaces;
public interface IWebhookDispatcher
{
    Task DispatchAsync(string eventName, object payload, CancellationToken ct = default);
}