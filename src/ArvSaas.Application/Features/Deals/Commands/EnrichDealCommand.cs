using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using ArvSaas.Application.Features.Deals.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Features.Deals.Commands;

public record EnrichDealCommand(Guid DealId) : IRequest<Result<DealDto>>;

public class EnrichDealHandler(
    IAppDbContext db,
    ITenantProvider tenant,
    IAiAnalysisService ai) : IRequestHandler<EnrichDealCommand, Result<DealDto>>
{
    public async Task<Result<DealDto>> Handle(EnrichDealCommand request, CancellationToken cancellationToken)
    {
        // AI is a paid-tier feature — the gate written in Phase 1 finally gets used.
        var org = await db.Tenants.FirstAsync(t => t.Id == tenant.TenantId, cancellationToken);
        if (!org.CanUseAiAnalysis)
        {
            return Result.Failure<DealDto>(
                "AI analysis is available on Pro and Enterprise plans. Upgrade to unlock it.");
        }

        var deal = await db.Deals
            .Include(d => d.Comparables)
            .FirstOrDefaultAsync(d => d.Id == request.DealId, cancellationToken);

        if (deal is null)
        {
            return Result.Failure<DealDto>("Deal not found.");
        }

        if (deal.AfterRepairValue is null)
        {
            return Result.Failure<DealDto>("Run the analysis before requesting AI insights.");
        }

        var insight = await ai.AnalyzeDealAsync(deal, cancellationToken);

        if (insight is null)
        {
            // AI provider unreachable/failed — the product must still respond.
            // Deterministic fallback per spec, not an error to the caller.
            deal.AiRecommendation = "AI analysis unavailable. Using deterministic analysis.";
            deal.AiStrengths = null;
            deal.AiRisks = null;
            deal.AiNegotiationAdvice = null;
            deal.AiConfidenceScore = 0;

            await db.SaveChangesAsync(cancellationToken);
            return Result.Success(DealDto.From(deal));
        }

        deal.AiRecommendation = insight.Recommendation;
        deal.AiStrengths = string.Join('\n', insight.Strengths);
        deal.AiRisks = string.Join('\n', insight.Risks);
        deal.AiNegotiationAdvice = insight.NegotiationAdvice;
        deal.AiConfidenceScore = insight.ConfidenceScore;

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success(DealDto.From(deal));
    }
}