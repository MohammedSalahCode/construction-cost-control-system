using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.ToTable("Users");


        entity.HasKey(e => e.Id)
              .HasName("PK_Users");



        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.Email)
              .HasMaxLength(255);

        entity.Property(e => e.FullName)
              .HasMaxLength(100);

        entity.Property(e => e.IsActive)
              .HasDefaultValue(true);

        entity.Property(e => e.PasswordHash)
              .HasMaxLength(255);


        entity.HasIndex(e => e.Email, "UQ_Users_Email")
              .IsUnique();


        entity.HasOne(d => d.Role)
              .WithMany(p => p.Users)
              .HasForeignKey(d => d.RoleId)
              .OnDelete(DeleteBehavior.ClientSetNull)
              .HasConstraintName("FK_Users_Roles");
    }
}