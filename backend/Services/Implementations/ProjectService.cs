using backend.DTOs.Projects;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectResponse>> GetAllForUserAsync(Guid userId)
    {
        var projects = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
            .ToListAsync();

        return projects.Select(MapToResponse).ToList();
    }

    public async Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId)
    {
        var project = await GetProjectWithAccessCheck(projectId, userId);
        return MapToResponse(project);
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid ownerId)
    {
        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = ownerId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Reload with Owner included so the response has the owner's name
        await _context.Entry(project).Reference(p => p.Owner).LoadAsync();

        return MapToResponse(project);
    }

    public async Task<ProjectResponse> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid userId)
    {
        var project = await GetProjectWithAccessCheck(projectId, userId);

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can update it");

        project.Name = request.Name;
        project.Description = request.Description;
        project.Status = request.Status;

        await _context.SaveChangesAsync();

        return MapToResponse(project);
    }

    public async Task DeleteAsync(Guid projectId, Guid userId)
    {
        var project = await GetProjectWithAccessCheck(projectId, userId);

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can delete it");

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }

    // Shared helper - loads a project and verifies the user has access to it
    private async Task<Project> GetProjectWithAccessCheck(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new KeyNotFoundException("Project not found");

        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess)
            throw new UnauthorizedAccessException("You do not have access to this project");

        return project;
    }
    public async Task<ProjectResponse> UpdateImageAsync(Guid projectId, string imageUrl, Guid userId)
    {
        var project = await GetProjectWithAccessCheck(projectId, userId);

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can update the image");

        project.ImageUrl = imageUrl;
        await _context.SaveChangesAsync();

        return MapToResponse(project);
    }

    private static ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            OwnerId = project.OwnerId,
            OwnerName = project.Owner.FullName,
            CreatedAt = project.CreatedAt,
            MemberCount = project.Members.Count,
            ImageUrl = project.ImageUrl
        };
    }
}