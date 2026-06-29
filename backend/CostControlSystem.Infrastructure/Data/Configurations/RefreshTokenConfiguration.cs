using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CostControlSystem.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> entity)
    {
        entity.ToTable("RefreshTokens");


        entity.HasKey(e => e.Id)
              .HasName("PK_RefreshTokens");


        entity.Property(e => e.CreatedAt)
              .HasDefaultValueSql("(getdate())")
              .HasColumnType("datetime");

        entity.Property(e => e.ExpiresAt)
              .HasColumnType("datetime");

        entity.Property(e => e.RevokedAt)
              .HasColumnType("datetime");

        entity.Property(e => e.TokenHash)
              .HasMaxLength(255);


        entity.HasIndex(e => e.TokenHash, "UQ_RefreshTokens_TokenHash")
              .IsUnique();


        entity.HasOne(d => d.User)
              .WithMany(p => p.RefreshTokens)
              .HasForeignKey(d => d.UserId)
              .HasConstraintName("FK_RefreshTokens_Users");
    }
}