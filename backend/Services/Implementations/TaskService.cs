using backend.DTOs.Tasks;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskResponse>> GetAllForProjectAsync(Guid projectId, Guid userId)
    {
        await VerifyProjectAccessAsync(projectId, userId);

        var tasks = await _context.Tasks
            .Include(t => t.Assignee)
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();

        return tasks.Select(MapToResponse).ToList();
    }

    public async Task<TaskResponse> GetByIdAsync(Guid taskId, Guid userId)
    {
        var task = await GetTaskWithAccessCheck(taskId, userId);
        return MapToResponse(task);
    }

    public async Task<TaskResponse> CreateAsync(Guid projectId, CreateTaskRequest request, Guid userId)
    {
        await VerifyProjectAccessAsync(projectId, userId);

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            AssigneeId = request.AssigneeId,
            DueDate = request.DueDate
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        if (task.AssigneeId.HasValue)
            await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();

        return MapToResponse(task);
    }

    public async Task<TaskResponse> UpdateAsync(Guid taskId, UpdateTaskRequest request, Guid userId)
    {
        var task = await GetTaskWithAccessCheck(taskId, userId);

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.AssigneeId = request.AssigneeId;
        task.DueDate = request.DueDate;

        await _context.SaveChangesAsync();

        if (task.AssigneeId.HasValue)
            await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();

        return MapToResponse(task);
    }

    public async Task DeleteAsync(Guid taskId, Guid userId)
    {
        var task = await GetTaskWithAccessCheck(taskId, userId);
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }

    private async Task VerifyProjectAccessAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new KeyNotFoundException("Project not found");

        var hasAccess = project.OwnerId == userId ||
                        project.Members.Any(m => m.UserId == userId);

        if (!hasAccess)
            throw new UnauthorizedAccessException("You do not have access to this project");
    }

    private async Task<TaskItem> GetTaskWithAccessCheck(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Project)
                .ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        var hasAccess = task.Project.OwnerId == userId ||
                        task.Project.Members.Any(m => m.UserId == userId);

        if (!hasAccess)
            throw new UnauthorizedAccessException("You do not have access to this task");

        return task;
    }

    private static TaskResponse MapToResponse(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            AssigneeId = task.AssigneeId,
            AssigneeName = task.Assignee?.FullName,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt
        };
    }
}