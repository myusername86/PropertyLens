using MediatR;

namespace ArvSaas.Application.Common.Events;
public record DealApprovedEvent(
    Guid TenantId,
    Guid DealId,
    string Address,
    string City,
    decimal? RoiPercent,
    decimal? ProjectedProfit) : INotification;