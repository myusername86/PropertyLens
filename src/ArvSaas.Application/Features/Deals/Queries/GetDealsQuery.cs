using ArvSaas.Application.Common.Interfaces;
using ArvSaas.Application.Features.Deals.Dtos;
using ArvSaas.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArvSaas.Application.Features.Deals.Queries;

/// <summary>
/// Note: no TenantId parameter anywhere. The global query filter in
/// Infrastructure guarantees this only ever returns the caller's data.
/// </summary>
public record GetDealsQuery(DealStage? Stage = null) : IRequest<IReadOnlyList<DealDto>>;

public class GetDealsHandler(IAppDbContext db)
    : IRequestHandler<GetDealsQuery, IReadOnlyList<DealDto>>
{
    public async Task<IReadOnlyList<DealDto>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Deals.AsNoTracking();

        if (request.Stage is not null)
            query = query.Where(d => d.Stage == request.Stage);

        return await query
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => DealDto.From(d))
            .ToListAsync(cancellationToken);
    }
}