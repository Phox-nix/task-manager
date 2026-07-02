using backend.DTOs.Tasks;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/projects/{projectId}/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid projectId)
    {
        try
        {
            var userId = GetUserId();
            var tasks = await _taskService.GetAllForProjectAsync(projectId, userId);
            return Ok(tasks);
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

    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetById(Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            var task = await _taskService.GetByIdAsync(taskId, userId);
            return Ok(task);
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
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = GetUserId();
            var task = await _taskService.CreateAsync(projectId, request, userId);
            return CreatedAtAction(nameof(GetById), new { projectId, taskId = task.Id }, task);
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

    [HttpPut("{taskId}")]
    public async Task<IActionResult> Update(Guid taskId, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            var userId = GetUserId();
            var task = await _taskService.UpdateAsync(taskId, request, userId);
            return Ok(task);
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

    [HttpDelete("{taskId}")]
    public async Task<IActionResult> Delete(Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            await _taskService.DeleteAsync(taskId, userId);
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