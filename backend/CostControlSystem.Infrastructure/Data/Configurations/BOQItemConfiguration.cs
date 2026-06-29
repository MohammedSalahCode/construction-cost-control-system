using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class BOQItemConfiguration : IEntityTypeConfiguration<BOQItem>
{
    public void Configure(EntityTypeBuilder<BOQItem> entity)
    {
        entity.ToTable("BOQItems");

        entity.HasKey(e => e.Id)
              .HasName("PK_BOQItems");


        entity.Property(e => e.ItemName).HasMaxLength(255);

        entity.Property(e => e.ItemNumber).HasMaxLength(20);

        entity.Property(e => e.Notes).HasMaxLength(500);

        entity.Property(e => e.Quantity)
              .HasColumnType("decimal(18, 2)");

        entity.Property(e => e.TotalPrice)
              .HasComputedColumnSql("([Quantity]*[UnitPrice])", true)
              .HasColumnType("decimal(37, 4)");

        entity.Property(e => e.Unit)
              .HasMaxLength(50);

        entity.Property(e => e.UnitPrice)
              .HasColumnType("decimal(18, 2)");


        entity.HasIndex(e => e.ProjectId, "IX_BOQItems_ProjectId");

        entity.HasIndex(e => new { e.ProjectId, e.ItemNumber }, "UQ_BOQItems_Project_ItemNumber")
              .IsUnique();


        entity.HasOne(d => d.Project)
              .WithMany(p => p.BOQItems)
              .HasForeignKey(d => d.ProjectId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_BOQItems_Projects");
    }
}