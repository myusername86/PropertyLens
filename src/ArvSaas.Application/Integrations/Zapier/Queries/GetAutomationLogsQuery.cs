using ArvSaas.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Integrations.Zapier.Queries;

public record GetAutomationLogsQuery : IRequest<IReadOnlyList<AutomationLogDto>>;

public class GetAutomationLogsHandler(IAppDbContext db)
    : IRequestHandler<GetAutomationLogsQuery, IReadOnlyList<AutomationLogDto>>
{
    public async Task<IReadOnlyList<AutomationLogDto>> Handle(GetAutomationLogsQuery request, CancellationToken cancellationToken) =>
        await db.AutomationLogs
            .OrderByDescending(a => a.ExecutedAt)
            .Take(50)
            .Select(a => AutomationLogDto.From(a))
            .ToListAsync(cancellationToken);
}