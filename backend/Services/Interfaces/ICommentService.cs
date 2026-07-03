using backend.DTOs.Comments;
namespace backend.Services.Interfaces
{
    public interface ICommentService
    {
        Task<List<CommentResponse>> GetAllForTaskAsync(Guid taskId, Guid userId);
        Task<CommentResponse> CreateAsync(Guid taskId, CreateCommentRequest request, Guid userId);
        Task DeleteAsync(Guid commentId, Guid userId);
    }
}
