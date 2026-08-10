using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArvSaas.Infrastructure.Persistence.Configurations;

public class AutomationLogConfiguration : IEntityTypeConfiguration<AutomationLog>
{
    public void Configure(EntityTypeBuilder<AutomationLog> builder)
    {
        builder.Property(a => a.EventName).HasMaxLength(100).IsRequired();
        builder.Property(a => a.TargetUrl).HasMaxLength(2048).IsRequired();
        builder.Property(a => a.ErrorMessage).HasMaxLength(2000);

        builder.HasOne(a => a.WebhookSubscription)
            .WithMany(w => w.Logs)
            .HasForeignKey(a => a.WebhookSubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Activity log queries filter by tenant and sort by recency.
        builder.HasIndex(a => new { a.TenantId, a.ExecutedAt });
    }
}