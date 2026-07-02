namespace backend.DTOs.Tasks
{
    public class CreateTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
        public Guid? AssigneeId { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
