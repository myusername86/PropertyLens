namespace ArvSaas.Infrastructure.Billing;

public sealed class StripeOptions
{
    public const string SectionName = "Stripe";

    public required string SecretKey { get; init; }
    public required string ProMonthlyPriceId { get; init; }
    public required string ProYearlyPriceId { get; init; }
    public required string EnterpriseMonthlyPriceId { get; init; }
    public required string EnterpriseYearlyPriceId { get; init; }
    public required string SuccessUrl { get; init; }
    public required string CancelUrl { get; init; }
}