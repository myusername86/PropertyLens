using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Integrations.Zapier.Commands;

public record DeleteWebhookCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteWebhookHandler(IAppDbContext db) : IRequestHandler<DeleteWebhookCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteWebhookCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.WebhookSubscriptions.FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);
        if (subscription is null)
        {
            return Result.Failure<bool>("Webhook not found.");
        }

        db.WebhookSubscriptions.Remove(subscription);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}