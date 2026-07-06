using ArvSaas.Domain.Entities;

namespace ArvSaas.Application.Common.Interfaces;

/// <summary>
/// AI enrichment (Phase 4). Behind an interface so the core product
/// works without OpenAI, and so it can be mocked in tests.
/// </summary>
public interface IAiAnalysisService
{
    Task<AiDealInsight> AnalyzeDealAsync(Deal deal, CancellationToken ct = default);
}

public record AiDealInsight(string Recommendation, int ConfidenceScore);
