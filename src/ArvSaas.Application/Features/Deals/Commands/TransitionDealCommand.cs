using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using ArvSaas.Application.Features.Deals.Dtos;
using ArvSaas.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Features.Deals.Commands;

public record TransitionDealCommand(Guid DealId, string Action) : IRequest<Result<DealDto>>;

public class TransitionDealHandler(IAppDbContext db)
    : IRequestHandler<TransitionDealCommand, Result<DealDto>>
{
    public async Task<Result<DealDto>> Handle(TransitionDealCommand request, CancellationToken cancellationToken)
    {
        var deal = await db.Deals
            .Include(d => d.Comparables)
            .FirstOrDefaultAsync(d => d.Id == request.DealId, cancellationToken);

        if (deal is null)
            return Result.Failure<DealDto>("Deal not found.");

        try
        {
            switch (request.Action.ToLowerInvariant())
            {
                case "analyze":
                    deal.RunAnalysis();
                    break;
                case "approve":
                    deal.Approve();
                    break;
                case "reject":
                    deal.Reject();
                    break;
                default:
                    return Result.Failure<DealDto>($"Unknown action '{request.Action}'.");
            }
        }
        catch (DomainException ex)
        {
            return Result.Failure<DealDto>(ex.Message);
        }

        await db.SaveChangesAsync(cancellationToken);
        return Result.Success(DealDto.From(deal));
    }
}