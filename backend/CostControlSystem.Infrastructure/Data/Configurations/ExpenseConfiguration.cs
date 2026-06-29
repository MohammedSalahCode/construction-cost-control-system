using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> entity)
    {
        entity.ToTable("Expenses");

        entity.HasKey(e => e.Id)
              .HasName("PK_Expenses");

        entity.Property(e => e.Amount)
              .HasColumnType("decimal(18, 2)");

        entity.Property(e => e.ApprovedAt)
              .HasColumnType("datetime");

        entity.Property(e => e.BOQItemId)
              .HasColumnName("BOQItemId");

        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.Description)
              .HasMaxLength(500);

        entity.Property(e => e.ExpenseType)
              .HasMaxLength(20);

        entity.Property(e => e.Status)
              .HasMaxLength(20)
              .HasDefaultValue("Pending");


        entity.HasIndex(e => e.BOQItemId, "IX_Expenses_BOQItemId");

        entity.HasIndex(e => e.ProjectId, "IX_Expenses_ProjectId");

        entity.HasIndex(e => e.Status, "IX_Expenses_Status");


        entity.HasOne(d => d.ApprovedByUser)
              .WithMany(p => p.ApprovedExpenses)
              .HasForeignKey(d => d.ApprovedBy)
              .HasConstraintName("FK_Expenses_ApprovedBy");

        entity.HasOne(d => d.BOQItem)
              .WithMany(p => p.Expenses)
              .HasForeignKey(d => d.BOQItemId)
              .HasConstraintName("FK_Expenses_BOQItems");

        entity.HasOne(d => d.CreatedByUser)
              .WithMany(p => p.CreatedExpenses)
              .HasForeignKey(d => d.CreatedBy)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_Expenses_CreatedBy");

        entity.HasOne(d => d.Project)
              .WithMany(p => p.Expenses)
              .HasForeignKey(d => d.ProjectId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_Expenses_Projects");
    }
}