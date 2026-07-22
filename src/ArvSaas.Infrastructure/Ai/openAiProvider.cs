
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ArvSaas.Infrastructure.Ai;

/// <summary>
/// OpenAI-backed deal analyst. Sends only computed metrics to the model
/// (never raw calculations) and requests structured JSON output matching
/// AiDealInsight. Never throws to the caller - returns null on any
/// failure so the product degrades gracefully.
/// </summary>
public sealed class OpenAiProvider(
    HttpClient httpClient,
    IOptions<AiOptions> options,
    ILogger<OpenAiProvider> logger) : IAiAnalysisService
{
    private readonly AiOptions _options = options.Value;

    private const string SystemPrompt =
        "You are a conservative real estate investment analyst. You analyze fix-and-flip opportunities. " +
        "You never invent missing information. You base recommendations only on supplied metrics. Return JSON only.";

    public async Task<AiDealInsight?> AnalyzeDealAsync(Deal deal, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_options.ApiKey))
        {
            logger.LogInformation("AI analysis skipped: no API key configured");
            return null;
        }

        const int maxAttempts = 3;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
                timeout.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

                var userPrompt = BuildPrompt(deal);

                var requestBody = new
                {
                    model = _options.Model,
                    messages = new[]
                    {
                        new { role = "system", content = SystemPrompt },
                        new { role = "user", content = userPrompt }
                    },
                    response_format = new { type = "json_object" },
                    temperature = 0.4
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
                {
                    Content = JsonContent.Create(requestBody)
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

                var response = await httpClient.SendAsync(request, timeout.Token);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests && attempt < maxAttempts)
                {
                    var delaySeconds = attempt * 5;
                    logger.LogInformation("AI provider rate-limited (attempt {Attempt}/{Max}); retrying in {Delay}s", attempt, maxAttempts, delaySeconds);
                    await Task.Delay(TimeSpan.FromSeconds(delaySeconds), ct);
                    continue;
                }

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync(timeout.Token);
                    logger.LogWarning("AI provider returned {StatusCode}: {Body}", response.StatusCode, errorBody);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync(timeout.Token);
                return ParseInsight(json);
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                logger.LogWarning("AI analysis timed out after {Seconds}s", _options.TimeoutSeconds);
                return null;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AI analysis failed; continuing without AI insight");
                return null;
            }
        }

        logger.LogWarning("AI provider still rate-limited after {Max} attempts", maxAttempts);
        return null;
    }

    private static string BuildPrompt(Deal deal) => $$"""
        Analyze this fix-and-flip real estate deal. Respond with ONLY a JSON object with exactly these fields:
        "recommendation" (string, 2-3 sentences), "strengths" (array of strings), "risks" (array of strings),
        "negotiationAdvice" (string), "confidenceScore" (integer 0-100).

        Deal metrics (computed, trustworthy - do not recalculate):
        - Property: {{deal.Address}}, {{deal.City}}
        - Purchase price: {{deal.PurchasePrice:N0}}
        - Renovation cost: {{deal.RenovationCost:N0}}
        - Holding costs: {{deal.HoldingCosts:N0}}
        - After Repair Value (from {{deal.Comparables.Count}} comparables): {{deal.AfterRepairValue:N0}}
        - Estimated profit: {{deal.EstimatedProfit:N0}}
        - ROI: {{deal.RoiPercent}}%
        - Maximum allowable offer (70% rule): {{deal.MaxAllowableOffer:N0}}
        - Deterministic risk level: {{deal.RiskLevel}}

        Consider whether purchase price exceeds the maximum allowable offer, ROI adequacy for flip risk
        (20%+ is healthy), and comparable count (fewer than 3 means uncertain ARV).
        """;

    private AiDealInsight? ParseInsight(string responseJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            if (string.IsNullOrWhiteSpace(text))
            {
                return null;
            }

            using var inner = JsonDocument.Parse(text);
            var recommendation = inner.RootElement.GetProperty("recommendation").GetString() ?? "";
            var strengths = inner.RootElement.GetProperty("strengths").EnumerateArray().Select(e => e.GetString() ?? "").ToList();
            var risks = inner.RootElement.GetProperty("risks").EnumerateArray().Select(e => e.GetString() ?? "").ToList();
            var negotiationAdvice = inner.RootElement.GetProperty("negotiationAdvice").GetString() ?? "";
            var confidence = inner.RootElement.GetProperty("confidenceScore").GetInt32();

            return string.IsNullOrWhiteSpace(recommendation)
                ? null
                : new AiDealInsight(recommendation, strengths, risks, negotiationAdvice, Math.Clamp(confidence, 0, 100));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not parse AI response");
            return null;
        }
    }
}
