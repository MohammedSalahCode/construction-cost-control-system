using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class EstimatedCostConfiguration : IEntityTypeConfiguration<EstimatedCost>
{
    public void Configure(EntityTypeBuilder<EstimatedCost> entity)
    {
        entity.ToTable("EstimatedCosts");

        entity.HasKey(e => e.Id)
              .HasName("PK_EstimatedCosts");


        entity.Property(e => e.BOQItemId)
              .HasColumnName("BOQItemId");

        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.EstimatedUnitCost)
              .HasColumnType("decimal(18, 2)");

        entity.Property(e => e.UpdatedAt)
              .HasColumnType("datetime");


        entity.HasIndex(e => e.BOQItemId, "IX_EstimatedCosts_BOQItemId");

        entity.HasIndex(e => e.BOQItemId, "UQ_EstimatedCosts_BOQItemId")
              .IsUnique();

        entity.HasOne(d => d.BOQItem)
              .WithOne(p => p.EstimatedCost)
              .HasForeignKey<EstimatedCost>(d => d.BOQItemId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_EstimatedCosts_BOQItems");
    }
}