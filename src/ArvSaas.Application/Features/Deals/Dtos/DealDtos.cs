using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;

namespace ArvSaas.Application.Features.Deals.Dtos;

public record ComparableSaleDto(string Address, decimal SalePrice, decimal AdjustmentFactor);

public record CreateDealRequest(
    string Address,
    string City,
    string? State,
    decimal PurchasePrice,
    decimal RenovationCost,
    decimal HoldingCosts,
    List<ComparableSaleDto> Comparables);

public record DealDto(
    Guid Id,
    string Address,
    string City,
    decimal PurchasePrice,
    decimal RenovationCost,
    DealStage Stage,
    decimal? AfterRepairValue,
    decimal? EstimatedProfit,
    decimal? RoiPercent,
    decimal? MaxAllowableOffer,
    RiskLevel RiskLevel,
    string? AiRecommendation,
    IReadOnlyList<string>? AiStrengths,
    IReadOnlyList<string>? AiRisks,
    string? AiNegotiationAdvice,
    int? AiConfidenceScore,
    DateTimeOffset CreatedAt)
{
    public static DealDto From(Deal d) => new(
        d.Id, d.Address, d.City, d.PurchasePrice, d.RenovationCost,
        d.Stage, d.AfterRepairValue, d.EstimatedProfit, d.RoiPercent,
        d.MaxAllowableOffer, d.RiskLevel,
        d.AiRecommendation,
        SplitOrNull(d.AiStrengths),
        SplitOrNull(d.AiRisks),
        d.AiNegotiationAdvice,
        d.AiConfidenceScore,
        d.CreatedAt);

    private static IReadOnlyList<string>? SplitOrNull(string? value) =>
        string.IsNullOrEmpty(value)
            ? null
            : value.Split('\n', StringSplitOptions.RemoveEmptyEntries);
}