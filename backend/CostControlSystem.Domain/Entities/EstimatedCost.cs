using System;
using System.Collections.Generic;

namespace CostControlSystem.Domain.Entities;

public partial class EstimatedCost
{
    public int Id { get; set; }

    public int BoqitemId { get; set; }

    public decimal EstimatedUnitCost { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Boqitem Boqitem { get; set; } = null!;
}
