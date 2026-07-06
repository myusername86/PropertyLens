using ArvSaas.Domain.Entities;
using ArvSaas.Domain.Enums;

namespace ArvSaas.Domain.Tests;

public class DealTests
{
    // Helper: the Testgatan deal you tested manually in Swagger.
    private static Deal CreateTestgatanDeal() => new()
    {
        Address = "Testgatan 12",
        City = "Gothenburg",
        PurchasePrice = 200_000m,
        RenovationCost = 40_000m,
        HoldingCosts = 5_000m,
        Comparables =
        [
            new ComparableSale { Address = "Testgatan 10", SalePrice = 310_000m, AdjustmentFactor = 1.0m },
            new ComparableSale { Address = "Testgatan 14", SalePrice = 295_000m, AdjustmentFactor = 1.05m }
        ]
    };

    [Fact]
    public void RunAnalysis_ComputesArvFromAdjustedComparables()
    {
        var deal = CreateTestgatanDeal();

        deal.RunAnalysis();

        // (310000*1.0 + 295000*1.05) / 2 = (310000 + 309750) / 2
        Assert.Equal(309_875m, deal.AfterRepairValue);
    }

    [Fact]
    public void RunAnalysis_ComputesProfitAndRoi()
    {
        var deal = CreateTestgatanDeal();

        deal.RunAnalysis();

        // Investment = 245000; selling costs = 309875 * 0.08 = 24790
        // Profit = 309875 - 24790 - 245000 = 40085; ROI = 40085/245000 = 16.4%
        Assert.Equal(40_085m, deal.EstimatedProfit);
        Assert.Equal(16.4m, deal.RoiPercent);
    }

    [Fact]
    public void RunAnalysis_ComputesMaxAllowableOfferUsing70PercentRule()
    {
        var deal = CreateTestgatanDeal();

        deal.RunAnalysis();

        // 309875 * 0.70 - 40000 = 176912.5 → banker's rounding → 176912
        Assert.Equal(176_912m, deal.MaxAllowableOffer);
    }

    [Fact]
    public void RunAnalysis_FlagsMediumRisk_WhenPriceExceedsMaxAllowableOffer()
    {
        // Purchase 200k > MAO ~177k (+2), ROI 16.4% < 20 (+1) → score 3 → Medium
        var deal = CreateTestgatanDeal();

        deal.RunAnalysis();

        Assert.Equal(RiskLevel.Medium, deal.RiskLevel);
    }

    [Fact]
    public void RunAnalysis_FlagsLowRisk_ForStrongDeal()
    {
        var deal = new Deal
        {
            Address = "Bra Affär 1",
            City = "Gothenburg",
            PurchasePrice = 150_000m,
            RenovationCost = 30_000m,
            HoldingCosts = 5_000m,
            Comparables =
            [
                new ComparableSale { Address = "Comp A", SalePrice = 300_000m },
                new ComparableSale { Address = "Comp B", SalePrice = 300_000m }
            ]
        };

        deal.RunAnalysis();

        // ROI = 91000/185000 = 49.2% and price below MAO (180000) → Low
        Assert.Equal(RiskLevel.Low, deal.RiskLevel);
    }

    [Fact]
    public void RunAnalysis_Throws_WhenNoComparables()
    {
        var deal = new Deal { Address = "X", City = "Y", PurchasePrice = 100_000m };

        var ex = Assert.Throws<DomainException>(deal.RunAnalysis);
        Assert.Contains("comparable", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void RunAnalysis_MovesNewDealToAnalyzing()
    {
        var deal = CreateTestgatanDeal();
        Assert.Equal(DealStage.New, deal.Stage);

        deal.RunAnalysis();

        Assert.Equal(DealStage.Analyzing, deal.Stage);
    }

    [Fact]
    public void Approve_Throws_WhenAnalysisNotRun()
    {
        var deal = CreateTestgatanDeal();

        Assert.Throws<DomainException>(deal.Approve);
    }

    [Fact]
    public void Approve_Succeeds_AfterAnalysis_AndCannotApproveTwice()
    {
        var deal = CreateTestgatanDeal();
        deal.RunAnalysis();

        deal.Approve();
        Assert.Equal(DealStage.Approved, deal.Stage);

        Assert.Throws<DomainException>(deal.Approve);
    }

    [Fact]
    public void Reject_Throws_WhenDealAlreadyApproved()
    {
        var deal = CreateTestgatanDeal();
        deal.RunAnalysis();
        deal.Approve();

        Assert.Throws<DomainException>(deal.Reject);
    }

    [Fact]
    public void ComparableSale_AdjustedPrice_AppliesFactorAndRounds()
    {
        var comp = new ComparableSale { Address = "C", SalePrice = 295_000m, AdjustmentFactor = 1.05m };

        Assert.Equal(309_750m, comp.AdjustedPrice);
    }

    [Fact]
    public void Tenant_FreePlan_LimitsActiveDealsToFive()
    {
        var tenant = new Tenant { Name = "T", Plan = SubscriptionPlan.Free };

        Assert.Equal(5, tenant.MaxActiveDeals);
        Assert.False(tenant.CanUseAiAnalysis);
    }
}