using ArvSaas.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Integrations.Zapier.Queries;

public record GetWebhooksQuery : IRequest<IReadOnlyList<WebhookSubscriptionDto>>;

public class GetWebhooksHandler(IAppDbContext db)
    : IRequestHandler<GetWebhooksQuery, IReadOnlyList<WebhookSubscriptionDto>>
{
    public async Task<IReadOnlyList<WebhookSubscriptionDto>> Handle(GetWebhooksQuery request, CancellationToken cancellationToken) =>
        await db.WebhookSubscriptions
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => WebhookSubscriptionDto.From(w))
            .ToListAsync(cancellationToken);
}