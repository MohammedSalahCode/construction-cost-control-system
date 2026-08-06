namespace CostControlSystem.Application.CostAnalysis.DTOs.Responses
{
    public class CostControlAlertsDto
    {
        public int CostOverruns { get; set; }

        public int ProgressWithoutCost { get; set; }

        public int MissingEstimatedCost { get; set; }

        public int LossRisk { get; set; }
    }
}
