using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class ProgressEntryConfiguration : IEntityTypeConfiguration<ProgressEntry>
{
    public void Configure(EntityTypeBuilder<ProgressEntry> entity)
    {
        entity.ToTable("ProgressEntries");

        entity.HasKey(e => e.Id)
              .HasName("PK_ProgressEntries");


        entity.Property(e => e.ApprovedAt)
              .HasColumnType("datetime");

        entity.Property(e => e.BOQItemId)
              .HasColumnName("BOQItemId");

        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.ExecutionDate)
              .HasColumnType("date");

        entity.Property(e => e.UpdatedAt)
              .HasColumnType("datetime");

        entity.Property(e => e.QuantityDone)
              .HasColumnType("decimal(18, 2)");

        entity.Property(e => e.Status)
              .HasMaxLength(20);

        entity.Property(e => e.ReviewerComment)
              .HasMaxLength(1000);

        entity.HasIndex(e => e.BOQItemId, "IX_ProgressEntries_BOQItemId");

        entity.HasIndex(e => e.ProjectId, "IX_ProgressEntries_ProjectId");


        entity.HasOne(d => d.ApprovedByUser)
              .WithMany(p => p.ApprovedProgressEntries)
              .HasForeignKey(d => d.ApprovedBy)
              .HasConstraintName("FK_ProgressEntries_ApprovedBy");

        entity.HasOne(d => d.BOQItem)
              .WithMany(p => p.ProgressEntries)
              .HasForeignKey(d => d.BOQItemId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_ProgressEntries_BOQItems");

        entity.HasOne(d => d.CreatedByUser)
              .WithMany(p => p.CreatedProgressEntries)
              .HasForeignKey(d => d.CreatedBy)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_ProgressEntries_CreatedBy");

        entity.HasOne(d => d.Project)
              .WithMany(p => p.ProgressEntries)
              .HasForeignKey(d => d.ProjectId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_ProgressEntries_Projects");
    }
}
