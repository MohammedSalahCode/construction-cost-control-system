using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> entity)
    {
        entity.ToTable("Projects");


        entity.HasKey(e => e.Id)
              .HasName("PK_Projects");


        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.Description)
              .HasMaxLength(500);

        entity.Property(e => e.Name)
              .HasMaxLength(150);


        entity.HasOne(d => d.CreatedByUser)
              .WithMany(p => p.Projects)
              .HasForeignKey(d => d.CreatedBy)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_Projects_Users");
    }
}