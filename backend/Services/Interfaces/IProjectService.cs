using backend.DTOs.Projects;
namespace backend.Services.Interfaces
{
    public interface IProjectService
    {
        Task<List<ProjectResponse>> GetAllForUserAsync(Guid userId);
        Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId);
        Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid ownerId);
        Task<ProjectResponse> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid userId);
        Task DeleteAsync(Guid projectId, Guid userId);

    }
}
