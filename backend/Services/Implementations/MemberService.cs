using backend.DTOs.Members;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class MemberService : IMemberService
{
    private readonly ApplicationDbContext _context;

    public MemberService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MemberResponse>> GetAllAsync(Guid projectId, Guid userId)
    {
        await VerifyProjectAccessAsync(projectId, userId);

        var members = await _context.ProjectMembers
            .Include(m => m.User)
            .Where(m => m.ProjectId == projectId)
            .ToListAsync();

        return members.Select(MapToResponse).ToList();
    }

    public async Task<MemberResponse> AddAsync(Guid projectId, AddMemberRequest request, Guid userId)
    {
        var project = await GetProjectAsOwnerAsync(projectId, userId);

        // Find the user by email
        var userToAdd = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (userToAdd == null)
            throw new KeyNotFoundException("No user found with that email address");

        // Check if already a member
        var alreadyMember = await _context.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == userToAdd.Id);

        if (alreadyMember)
            throw new InvalidOperationException("This user is already a member of the project");

        // Can't add the owner as a member
        if (project.OwnerId == userToAdd.Id)
            throw new InvalidOperationException("The project owner cannot be added as a member");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = userToAdd.Id
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        await _context.Entry(member).Reference(m => m.User).LoadAsync();

        return MapToResponse(member);
    }

    public async Task RemoveAsync(Guid projectId, Guid memberId, Guid userId)
    {
        await GetProjectAsOwnerAsync(projectId, userId);

        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == memberId);

        if (member == null)
            throw new KeyNotFoundException("Member not found in this project");

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
    }

    private async Task<Project> GetProjectAsOwnerAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new KeyNotFoundException("Project not found");

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can manage members");

        return project;
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

    private static MemberResponse MapToResponse(ProjectMember member)
    {
        return new MemberResponse
        {
            UserId = member.UserId,
            FullName = member.User.FullName,
            Email = member.User.Email,
            Role = member.Role,
            JoinedAt = member.JoinedAt
        };
    }
}