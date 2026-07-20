using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace ArvSaas.Infrastructure.Ai;

/// <summary>
/// Deterministic, zero-cost fallback for AI deal analysis. Implements the
/// same contract as a real LLM provider — selected via Ai:Provider = "Mock"
/// in configuration. Used for local development, demos, and as the
/// automatic fallback when no paid provider is configured.
/// </summary>
public sealed class MockAiProvider(ILogger<MockAiProvider> logger) : IAiAnalysisService
{
    public Task<AiDealInsight?> AnalyzeDealAsync(Deal deal, CancellationToken ct = default)
    {
        logger.LogInformation("Generating offline AI insight for deal {DealId}", deal.Id);

        var strengths = new List<string>();
        var risks = new List<string>();
        var confidence = 70;

        var withinBudget = deal.MaxAllowableOffer is not null && deal.PurchasePrice <= deal.MaxAllowableOffer;
        if (withinBudget)
        {
            strengths.Add("Purchase price is at or below the maximum allowable offer");
            confidence += 10;
        }
        else if (deal.MaxAllowableOffer is not null)
        {
            var overBy = deal.PurchasePrice - deal.MaxAllowableOffer.Value;
            risks.Add($"Purchase price exceeds the maximum allowable offer by {overBy:N0}");
            confidence -= 20;
        }

        if (deal.RoiPercent is not null)
        {
            if (deal.RoiPercent >= 20)
            {
                strengths.Add($"ROI of {deal.RoiPercent}% exceeds typical fix-and-flip targets");
                confidence += 10;
            }
            else if (deal.RoiPercent < 10)
            {
                risks.Add($"ROI of {deal.RoiPercent}% is thin and leaves little room for cost overruns");
                confidence -= 15;
            }
        }

        if (deal.Comparables.Count < 3)
        {
            risks.Add($"Only {deal.Comparables.Count} comparable sale(s) used — ARV carries more uncertainty");
            confidence -= 10;
        }
        else
        {
            strengths.Add($"ARV is grounded in {deal.Comparables.Count} comparable sales");
        }

        if (deal.RiskLevel == RiskLevel.High)
        {
            risks.Add("Deterministic risk score is High — proceed only with strong contingency plans");
            confidence -= 15;
        }

        if (strengths.Count == 0) strengths.Add("No standout strengths identified from the current metrics");
        if (risks.Count == 0) risks.Add("No significant risks identified from the current metrics");

        var recommendation = withinBudget && deal.RoiPercent is >= 15
            ? "Proceed. The deal meets ROI and pricing targets based on the metrics provided."
            : "Proceed with caution. Review the risks below before committing.";

        var negotiationAdvice = deal.MaxAllowableOffer is not null
            ? $"Target an offer at or below {deal.MaxAllowableOffer:N0} to preserve your margin."
            : "Insufficient data to suggest a negotiation range.";

        var insight = new AiDealInsight(
            recommendation,
            strengths,
            risks,
            negotiationAdvice,
            Math.Clamp(confidence, 10, 95));

        return Task.FromResult<AiDealInsight?>(insight);
    }
}