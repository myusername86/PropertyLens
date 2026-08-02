using System.Security.Cryptography;
using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Common.Models;
using ArvSaas.Domain.Entities;
using FluentValidation;
using MediatR;

namespace ArvSaas.Application.Integrations.Zapier.Commands;

public record CreateWebhookCommand(string EventName, string TargetUrl) : IRequest<Result<WebhookSubscriptionDto>>;

public class CreateWebhookValidator : AbstractValidator<CreateWebhookCommand>
{
    private static readonly string[] ValidEvents = ["DealApproved", "DealRejected"];

    public CreateWebhookValidator()
    {
        RuleFor(x => x.EventName).Must(e => ValidEvents.Contains(e))
            .WithMessage($"Event must be one of: {string.Join(", ", ValidEvents)}");
        RuleFor(x => x.TargetUrl).NotEmpty().Must(BeAValidHttpsUrl)
            .WithMessage("Target URL must be a valid https:// URL.");
    }

    private static bool BeAValidHttpsUrl(string url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == "https";
}

public class CreateWebhookHandler(IAppDbContext db, ITenantProvider tenant)
    : IRequestHandler<CreateWebhookCommand, Result<WebhookSubscriptionDto>>
{
    public async Task<Result<WebhookSubscriptionDto>> Handle(CreateWebhookCommand request, CancellationToken cancellationToken)
    {
        var subscription = new WebhookSubscription
        {
            TenantId = tenant.TenantId,
            EventName = request.EventName,
            TargetUrl = request.TargetUrl,
            Secret = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant()
        };

        db.WebhookSubscriptions.Add(subscription);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success(WebhookSubscriptionDto.From(subscription));
    }
}