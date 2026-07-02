using backend.DTOs.Tasks;
namespace backend.Services.Interfaces
{
    public interface ITaskService
    {
        Task<List<TaskResponse>> GetAllForProjectAsync(Guid projectId, Guid userId);
        Task<TaskResponse> GetByIdAsync(Guid taskId, Guid userId);
        Task<TaskResponse> CreateAsync(Guid projectId, CreateTaskRequest request, Guid userId);
        Task<TaskResponse> UpdateAsync(Guid taskId, UpdateTaskRequest request, Guid userId);
        Task DeleteAsync(Guid taskId, Guid userId);
    }
}
