using ArvSaas.Domain.Entities;

namespace ArvSaas.Application.Common.Interfaces;

public interface IAiAnalysisService
{
    Task<AiDealInsight?> AnalyzeDealAsync(Deal deal, CancellationToken ct = default);
}

public record AiDealInsight(
    string Recommendation,
    IReadOnlyList<string> Strengths,
    IReadOnlyList<string> Risks,
    string NegotiationAdvice,
    int ConfidenceScore);