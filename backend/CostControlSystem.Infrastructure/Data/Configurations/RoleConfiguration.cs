using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> entity)
    {
        entity.ToTable("Roles");


        entity.HasKey(e => e.Id)
              .HasName("PK_Roles");


        entity.Property(e => e.Name)
              .HasMaxLength(50);


        entity.HasIndex(e => e.Name, "UQ_Roles_Name")
              .IsUnique();
    }
}