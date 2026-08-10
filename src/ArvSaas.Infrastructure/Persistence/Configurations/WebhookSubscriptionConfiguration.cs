using ArvSaas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArvSaas.Infrastructure.Persistence.Configurations;

public class WebhookSubscriptionConfiguration : IEntityTypeConfiguration<WebhookSubscription>
{
    public void Configure(EntityTypeBuilder<WebhookSubscription> builder)
    {
        builder.Property(w => w.EventName).HasMaxLength(100).IsRequired();
        builder.Property(w => w.TargetUrl).HasMaxLength(2048).IsRequired();
        builder.Property(w => w.Secret).HasMaxLength(200).IsRequired();

        // Every dashboard/dispatch query filters by tenant + event.
        builder.HasIndex(w => new { w.TenantId, w.EventName });
    }
}