using backend.DTOs.Projects;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var projects = await _projectService.GetAllForUserAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var project = await _projectService.GetByIdAsync(id, userId);
            return Ok(project);
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
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var userId = GetUserId();
        var project = await _projectService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        try
        {
            var userId = GetUserId();
            var project = await _projectService.UpdateAsync(id, request, userId);
            return Ok(project);
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = GetUserId();
            await _projectService.DeleteAsync(id, userId);
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

    // Extracts the logged-in user's Id from the JWT token claims
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        return Guid.Parse(userIdClaim);
    }
}