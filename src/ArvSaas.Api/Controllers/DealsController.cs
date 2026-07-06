using ArvSaas.Application.Features.Deals.Commands;
using ArvSaas.Application.Features.Deals.Dtos;
using ArvSaas.Application.Features.Deals.Queries;
using ArvSaas.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArvSaas.Api.Controllers;

[ApiController]
[Route("api/deals")]
[Authorize]
public class DealsController(ISender mediator) : ControllerBase
{
    /// <summary>List deals for the caller's organization, optionally filtered by pipeline stage.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DealDto>>> GetDeals(
        [FromQuery] DealStage? stage, CancellationToken ct)
        => Ok(await mediator.Send(new GetDealsQuery(stage), ct));

    /// <summary>Create a deal. Analysis (ARV, ROI, risk) runs immediately.</summary>
    [HttpPost]
    public async Task<ActionResult<DealDto>> CreateDeal(
        [FromBody] CreateDealRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateDealCommand(request), ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetDeals), new { }, result.Value)
            : UnprocessableEntity(new { error = result.Error });
    }

    /// <summary>Move a deal through the pipeline: analyze | approve | reject.</summary>
    [HttpPost("{id:guid}/{action}")]
    public async Task<ActionResult<DealDto>> Transition(
        Guid id, string action, CancellationToken ct)
    {
        var result = await mediator.Send(new TransitionDealCommand(id, action), ct);
        return result.IsSuccess ? Ok(result.Value) : UnprocessableEntity(new { error = result.Error });
    }
}
