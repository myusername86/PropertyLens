using ArvSaas.Domain.Common;
using ArvSaas.Domain.Enums;

namespace ArvSaas.Domain.Entities;

/// <summary>
/// Aggregate root for an investment deal. This is a rich domain model:
/// the ARV/ROI math and pipeline-stage rules live HERE, not in services
/// or controllers. That is what separates this from a CRUD app.
/// </summary>
public class Deal : AuditableEntity, ITenantOwned
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    // --- Property inputs ---
    public required string Address { get; set; }
    public required string City { get; set; }
    public string? State { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal RenovationCost { get; set; }
    public decimal HoldingCosts { get; set; }      // taxes, insurance, utilities during rehab
    public decimal SellingCostRate { get; set; } = 0.08m; // agent fees + closing, % of ARV

    /// <summary>Comparable sale prices used to estimate ARV.</summary>
    public ICollection<ComparableSale> Comparables { get; set; } = new List<ComparableSale>();

    // --- Computed analysis (persisted snapshot) ---
    public decimal? AfterRepairValue { get; private set; }
    public decimal? EstimatedProfit { get; private set; }
    public decimal? RoiPercent { get; private set; }
    public decimal? MaxAllowableOffer { get; private set; }
    public RiskLevel RiskLevel { get; private set; } = RiskLevel.Unknown;

    // --- AI enrichment (Phase 4) ---
    public string? AiRecommendation { get; set; }
    public int? AiConfidenceScore { get; set; }
    public string? AiStrengths { get; set; }        // newline-separated
    public string? AiRisks { get; set; }             // newline-separated
    public string? AiNegotiationAdvice { get; set; }

    // --- Pipeline ---
    public DealStage Stage { get; private set; } = DealStage.New;

    /// <summary>
    /// Core investment math. ARV from comps, profit, ROI, and the
    /// classic 70%-rule maximum allowable offer.
    /// </summary>
    public void RunAnalysis()
    {
        if (Comparables.Count == 0)
            throw new DomainException("At least one comparable sale is required to run analysis.");

        // ARV = average of price-per-sqm of comps * subject sqm, simplified
        // here to average comp price adjusted by condition weighting.
        AfterRepairValue = Math.Round(Comparables.Average(c => c.AdjustedPrice), 0);

        var totalInvestment = PurchasePrice + RenovationCost + HoldingCosts;
        var sellingCosts = AfterRepairValue.Value * SellingCostRate;

        EstimatedProfit = Math.Round(AfterRepairValue.Value - sellingCosts - totalInvestment, 0);
        RoiPercent = totalInvestment > 0
            ? Math.Round(EstimatedProfit.Value / totalInvestment * 100, 1)
            : 0;

        // 70% rule: max offer = 70% of ARV minus renovation cost
        MaxAllowableOffer = Math.Round(AfterRepairValue.Value * 0.70m - RenovationCost, 0);

        RiskLevel = ScoreRisk();

        if (Stage == DealStage.New)
            Stage = DealStage.Analyzing;
    }

    /// <summary>
    /// Deterministic baseline risk score. The AI layer (Phase 4) refines
    /// this, but the app must never depend on OpenAI being available.
    /// </summary>
    private RiskLevel ScoreRisk()
    {
        if (RoiPercent is null) return RiskLevel.Unknown;

        var compSpread = Comparables.Count > 1
            ? (Comparables.Max(c => c.AdjustedPrice) - Comparables.Min(c => c.AdjustedPrice))
              / Comparables.Average(c => c.AdjustedPrice)
            : 0.5m; // single comp = inherently uncertain

        var score = 0;
        if (RoiPercent < 10) score += 2;
        else if (RoiPercent < 20) score += 1;
        if (compSpread > 0.25m) score += 2;
        else if (compSpread > 0.15m) score += 1;
        if (PurchasePrice > (MaxAllowableOffer ?? 0)) score += 2;

        return score switch
        {
            <= 1 => RiskLevel.Low,
            <= 3 => RiskLevel.Medium,
            _ => RiskLevel.High
        };
    }

    /// <summary>Pipeline transitions are guarded — no arbitrary stage jumps.</summary>
    public void Approve()
    {
        if (Stage != DealStage.Analyzing)
            throw new DomainException($"Cannot approve a deal in stage '{Stage}'. Run analysis first.");
        if (AfterRepairValue is null)
            throw new DomainException("Cannot approve a deal without a completed analysis.");
        Stage = DealStage.Approved;
    }

    public void Reject()
    {
        if (Stage is DealStage.Approved or DealStage.Rejected)
            throw new DomainException($"Cannot reject a deal in stage '{Stage}'.");
        Stage = DealStage.Rejected;
    }
}

public class ComparableSale : BaseEntity
{
    public Guid DealId { get; set; }
    public required string Address { get; set; }
    public decimal SalePrice { get; set; }

    /// <summary>Manual adjustment factor for condition/size differences (1.0 = identical).</summary>
    public decimal AdjustmentFactor { get; set; } = 1.0m;

    public decimal AdjustedPrice => Math.Round(SalePrice * AdjustmentFactor, 0);
}

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}