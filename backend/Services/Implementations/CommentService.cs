using backend.DTOs.Comments;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class CommentService: ICommentService
{
    private readonly ApplicationDbContext _context;
    public CommentService (ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<List<CommentResponse>> GetAllForTaskAsync(Guid taskId, Guid userId)
    {
        await VerifyTaskAccessAsync(taskId, userId);
        var comments = await _context.Comments
            .Include(c => c.Author)
            .Where(c => c.TaskId == taskId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
        return comments.Select(MapToResponse).ToList();

    }
    public async Task<CommentResponse> CreateAsync(Guid taskId, CreateCommentRequest request, Guid userId)
    {
        await VerifyTaskAccessAsync(taskId, userId);

        var comment = new Comment
        {
            TaskId = taskId,
            AuthorId = userId,
            Content = request.Content
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        await _context.Entry(comment).Reference(c => c.Author).LoadAsync();

        return MapToResponse(comment);
    }
    public async Task DeleteAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Comments
           .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null)
            throw new KeyNotFoundException("Comment not found");

        if (comment.AuthorId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }
    public async Task VerifyTaskAccessAsync(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null) {
            throw new KeyNotFoundException("Task not found");
        }
        var hasAccess = task.Project.OwnerId == userId || task.Project.Members.Any(m=> m.UserId == userId);
        if (!hasAccess) {
            throw new UnauthorizedAccessException("You do not have access to this task");
        }
    }
    private static CommentResponse MapToResponse(Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            AuthorId = comment.AuthorId,
            AuthorName = comment.Author.FullName,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}

