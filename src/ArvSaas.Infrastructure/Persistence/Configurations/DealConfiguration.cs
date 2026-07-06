using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArvSaas.Infrastructure.Persistence.Configurations;

public class DealConfiguration : IEntityTypeConfiguration<Deal>
{
    public void Configure(EntityTypeBuilder<Deal> builder)
    {
        builder.Property(d => d.Address).HasMaxLength(300).IsRequired();
        builder.Property(d => d.City).HasMaxLength(100).IsRequired();
        builder.Property(d => d.State).HasMaxLength(100);
        builder.Property(d => d.PurchasePrice).HasPrecision(14, 2);
        builder.Property(d => d.RenovationCost).HasPrecision(14, 2);
        builder.Property(d => d.HoldingCosts).HasPrecision(14, 2);
        builder.Property(d => d.SellingCostRate).HasPrecision(5, 4);
        builder.Property(d => d.AfterRepairValue).HasPrecision(14, 2);
        builder.Property(d => d.EstimatedProfit).HasPrecision(14, 2);
        builder.Property(d => d.RoiPercent).HasPrecision(7, 1);
        builder.Property(d => d.MaxAllowableOffer).HasPrecision(14, 2);
        builder.Property(d => d.AiRecommendation).HasMaxLength(4000);

        // Composite index: every dashboard query filters by tenant + stage
        builder.HasIndex(d => new { d.TenantId, d.Stage });

        builder.HasMany(d => d.Comparables)
            .WithOne()
            .HasForeignKey(c => c.DealId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.StripeCustomerId).HasMaxLength(100);
        builder.Property(t => t.StripeSubscriptionId).HasMaxLength(100);
        builder.HasIndex(t => t.StripeCustomerId);
    }
}

public class ComparableSaleConfiguration : IEntityTypeConfiguration<ComparableSale>
{
    public void Configure(EntityTypeBuilder<ComparableSale> builder)
    {
        builder.Property(c => c.Address).HasMaxLength(300).IsRequired();
        builder.Property(c => c.SalePrice).HasPrecision(14, 2);
        builder.Property(c => c.AdjustmentFactor).HasPrecision(4, 2);
    }
}