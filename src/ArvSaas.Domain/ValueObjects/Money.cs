namespace ArvSaas.Domain.ValueObjects;

/// <summary>
/// Value object for currency amounts. Prevents "is this SEK or USD?" bugs
/// and keeps rounding rules in one place.
/// </summary>
public readonly record struct Money(decimal Amount, string Currency = "USD")
{
    public static Money Zero(string currency = "USD") => new(0, currency);

    public static Money operator +(Money a, Money b)
    {
        EnsureSameCurrency(a, b);
        return a with { Amount = a.Amount + b.Amount };
    }

    public static Money operator -(Money a, Money b)
    {
        EnsureSameCurrency(a, b);
        return a with { Amount = a.Amount - b.Amount };
    }

    public Money Multiply(decimal factor) => this with { Amount = Math.Round(Amount * factor, 2) };

    private static void EnsureSameCurrency(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException($"Currency mismatch: {a.Currency} vs {b.Currency}");
    }

    public override string ToString() => $"{Amount:N2} {Currency}";
}
