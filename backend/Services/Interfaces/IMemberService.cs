using backend.DTOs.Members;
namespace backend.Services.Interfaces
{
    public interface IMemberService
    {
        Task<List<MemberResponse>> GetAllAsync(Guid projectId, Guid userId);
        Task<MemberResponse> AddAsync(Guid projectId, AddMemberRequest request, Guid userId);
        Task RemoveAsync(Guid projectId, Guid memberId, Guid userId);
    }
}
