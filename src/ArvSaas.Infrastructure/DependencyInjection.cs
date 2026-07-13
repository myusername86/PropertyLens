using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Infrastructure.Persistence;
using ArvSaas.Infrastructure.Tenancy;
using ArvSaas.Infrastructure.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ArvSaas.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<HttpTenantProvider>();
        services.AddScoped<ITenantProvider>(sp => sp.GetRequiredService<HttpTenantProvider>());
        services.AddScoped<ICurrentUser>(sp => sp.GetRequiredService<HttpTenantProvider>());

        services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(
                config.GetConnectionString("Postgres"),
                npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
        services.Configure<StripeOptions>(config.GetSection(StripeOptions.SectionName));
        services.AddScoped<IBillingService, StripeBillingService>();

        return services;
    }
}
