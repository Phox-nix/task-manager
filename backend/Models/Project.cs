using Microsoft.EntityFrameworkCore.Query;

namespace backend.Models
{
    public class Project
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OwnerId { get; set; } 
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status {  get; set; } = "Active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Owner { get; set; } = null!;
        public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    }
}
