using backend.DTOs.Members;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/projects/{projectId}/members")]
[Authorize]
public class MembersController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MembersController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid projectId)
    {
        try
        {
            var userId = GetUserId();
            var members = await _memberService.GetAllAsync(projectId, userId);
            return Ok(members);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Guid projectId, [FromBody] AddMemberRequest request)
    {
        try
        {
            var userId = GetUserId();
            var member = await _memberService.AddAsync(projectId, request, userId);
            return Ok(member);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{memberId}")]
    public async Task<IActionResult> Remove(Guid projectId, Guid memberId)
    {
        try
        {
            var userId = GetUserId();
            await _memberService.RemoveAsync(projectId, memberId, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        return Guid.Parse(userIdClaim);
    }
}