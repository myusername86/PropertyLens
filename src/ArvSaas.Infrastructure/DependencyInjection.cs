using ArvSaas.Infrastructure.Ai;
using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Infrastructure.Persistence;
using ArvSaas.Infrastructure.Tenancy;
using ArvSaas.Infrastructure.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ArvSaas.Infrastructure.Identity;
using ArvSaas.Application.Integrations.Zapier;
using ArvSaas.Infrastructure.Integrations.Zapier;
using Microsoft.AspNetCore.Identity;


namespace ArvSaas.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddHttpContextAccessor();
        services.AddHttpClient<IZapierWebhookDispatcher, WebhookDispatcher>();

        services.AddScoped<HttpTenantProvider>();
        services.AddScoped<ITenantProvider>(sp => sp.GetRequiredService<HttpTenantProvider>());
        services.AddScoped<ICurrentUser>(sp => sp.GetRequiredService<HttpTenantProvider>());

        services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(
                config.GetConnectionString("Postgres"),
                npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddIdentityCore<ApplicationUser>(options =>
{
    // Sensible defaults — not overly strict, matches your "keep it focused" scope
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
        services.Configure<StripeOptions>(config.GetSection(StripeOptions.SectionName));
        services.AddScoped<IBillingService, StripeBillingService>();
        services.Configure<AiOptions>(config.GetSection(AiOptions.SectionName));
        services.Configure<AiOptions>(config.GetSection(AiOptions.SectionName));
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.SectionName));
services.AddScoped<IJwtTokenService, JwtTokenService>();

        var aiProvider = config["Ai:Provider"] ?? "Mock";
        switch (aiProvider)
        {
            case "Mock":
                services.AddScoped<IAiAnalysisService, MockAiProvider>();
                break;
            case "OpenAI":
                services.AddHttpClient<IAiAnalysisService, OpenAiProvider>();
                break;
            default:
                services.AddScoped<IAiAnalysisService, MockAiProvider>();
                break;
        }

        return services;
    }
}
