using ArvSaas.Application.Common.Events;
using MediatR;

namespace ArvSaas.Application.Integrations.Zapier;

/// <summary>
/// Listens for DealApprovedEvent and forwards it to the Zapier dispatcher.
/// This class is the entire coupling point between core deal logic and
/// Zapier — delete this file (and the rest of the Integrations/Zapier
/// folder) and TransitionDealCommand keeps working unmodified; the event
/// it publishes would simply have no listener.
/// </summary>
public class DealApprovedEventHandler(IZapierWebhookDispatcher dispatcher)
    : INotificationHandler<DealApprovedEvent>
{
    public Task Handle(DealApprovedEvent notification, CancellationToken ct)
    {
        return dispatcher.DispatchAsync(
            notification.TenantId,
            "DealApproved",
            new
            {
                dealId = notification.DealId,
                address = notification.Address,
                city = notification.City,
                roi = notification.RoiPercent,
                projectedProfit = notification.ProjectedProfit,
                status = "Approved"
            },
            ct);
    }
}