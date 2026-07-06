using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using ArvSaas.Application.Features.Deals.Dtos;
using ArvSaas.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Features.Deals.Commands;

public record CreateDealCommand(CreateDealRequest Request) : IRequest<Result<DealDto>>;

public class CreateDealValidator : AbstractValidator<CreateDealCommand>
{
    public CreateDealValidator()
    {
        RuleFor(x => x.Request.Address).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.PurchasePrice).GreaterThan(0);
        RuleFor(x => x.Request.RenovationCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Request.Comparables).NotEmpty()
            .WithMessage("At least one comparable sale is required.");
        RuleForEach(x => x.Request.Comparables).ChildRules(c =>
        {
            c.RuleFor(x => x.SalePrice).GreaterThan(0);
            c.RuleFor(x => x.AdjustmentFactor).InclusiveBetween(0.5m, 1.5m);
        });
    }
}

public class CreateDealHandler(IAppDbContext db, ITenantProvider tenant)
    : IRequestHandler<CreateDealCommand, Result<DealDto>>
{
    public async Task<Result<DealDto>> Handle(CreateDealCommand request, CancellationToken cancellationToken)
    {
        // Plan-based feature gating — a real SaaS concern, enforced server-side.
        var org = await db.Tenants.FirstAsync(t => t.Id == tenant.TenantId, cancellationToken);
        var activeDeals = await db.Deals.CountAsync(
            d => d.Stage != Domain.Enums.DealStage.Rejected, cancellationToken);

        if (activeDeals >= org.MaxActiveDeals)
            return Result.Failure<DealDto>(
                $"Your {org.Plan} plan allows {org.MaxActiveDeals} active deals. Upgrade to add more.");

        var r = request.Request;
        var deal = new Deal
        {
            TenantId = tenant.TenantId,
            Address = r.Address,
            City = r.City,
            State = r.State,
            PurchasePrice = r.PurchasePrice,
            RenovationCost = r.RenovationCost,
            HoldingCosts = r.HoldingCosts,
            Comparables = r.Comparables.Select(c => new ComparableSale
            {
                Address = c.Address,
                SalePrice = c.SalePrice,
                AdjustmentFactor = c.AdjustmentFactor
            }).ToList()
        };

        deal.RunAnalysis(); // domain logic fires immediately — user sees insight, not a form echo

        db.Deals.Add(deal);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success(DealDto.From(deal));
    }
}