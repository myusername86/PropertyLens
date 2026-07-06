namespace ArvSaas.Application.Common.Models;

/// <summary>Lightweight result wrapper so handlers don't throw for business-rule failures.</summary>
public record Result<T>(bool IsSuccess, T? Value, string? Error);

/// <summary>
/// Non-generic factory companion (CA1000 pattern — same as Tuple.Create).
/// Lets the compiler infer T: Result.Success(dto) instead of Result&lt;DealDto&gt;.Success(dto).
/// </summary>
public static class Result
{
    public static Result<T> Success<T>(T value) => new(true, value, null);
    public static Result<T> Failure<T>(string error) => new(false, default, error);
}