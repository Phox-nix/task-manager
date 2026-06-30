using Microsoft.EntityFrameworkCore;


namespace backend.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectMember> ProjectMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).IsRequired().HasDefaultValue("Member");
        });
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e=>e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasDefaultValue("Active");
            entity.HasOne(e=>e.Owner)
            .WithMany()
            .HasForeignKey(e => e.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(e => new { e.ProjectId, e.UserId });
            entity.HasOne(e => e.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(e => e.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e=> e.User)
            .WithMany()
            .HasForeignKey(e=>e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        });
    }
}