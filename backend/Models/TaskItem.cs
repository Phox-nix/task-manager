namespace backend.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProjectId { get; set; }
        public Guid? AssigneeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status {  get; set; } = "ToDo";
        public string Priority { get; set;} = "Medium";
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //navigation properties 
        public Project Project { get; set; } = null!;
        public User? Assignee { get; set; }


    }
}
