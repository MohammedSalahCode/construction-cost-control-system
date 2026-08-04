using CostControlSystem.Application.CostAnalysis.Enums;
using CostControlSystem.Application.CostAnalysis.Models;
using CostControlSystem.Application.Exceptions;

namespace CostControlSystem.Application.CostAnalysis.Helpers
{
    public static class CostAnalysisPeriodHelper
    {
        public static CostAnalysisPeriodRange GetPeriod(
            CostAnalysisPeriod period,
            DateOnly projectStartDate,
            DateOnly? startDate = null,
            DateOnly? endDate = null)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (period != CostAnalysisPeriod.Custom && (startDate.HasValue || endDate.HasValue))
            {
                throw new BusinessRuleException("Start date and end date can only be provided for a custom period.");
            }

            return period switch
            {
                CostAnalysisPeriod.Cumulative =>
                    new CostAnalysisPeriodRange
                    {
                        StartDate = projectStartDate,
                        EndDate = today
                    },

                CostAnalysisPeriod.CurrentWeek => GetCurrentWeek(today),

                CostAnalysisPeriod.CurrentMonth =>
                    new CostAnalysisPeriodRange
                    {
                        StartDate = new DateOnly(today.Year, today.Month, 1),
                        EndDate = today
                    },

                CostAnalysisPeriod.Custom => GetCustomPeriod(startDate, endDate, projectStartDate, today),

                _ => throw new ArgumentOutOfRangeException(nameof(period), period, null)
            };
        }

        private static CostAnalysisPeriodRange GetCurrentWeek(DateOnly date)
        {
            int daysFromSaturday = ((int)date.DayOfWeek + 1) % 7;

            return new CostAnalysisPeriodRange
            {
                StartDate = date.AddDays(-daysFromSaturday),
                EndDate = date
            };
        }

        private static CostAnalysisPeriodRange GetCustomPeriod(DateOnly? startDate, DateOnly? endDate, DateOnly projectStartDate, DateOnly today)
        {
            if (!startDate.HasValue || !endDate.HasValue)
            {
                throw new BusinessRuleException("Start date and end date are required for a custom period.");
            }

            if (startDate.Value < projectStartDate)
            {
                throw new BusinessRuleException("Start date cannot be earlier than the project start date.");
            }

            if (startDate.Value > endDate.Value)
            {
                throw new BusinessRuleException("Start date cannot be later than end date.");
            }

            if (endDate.Value > today)
            {
                throw new BusinessRuleException("End date cannot be in the future.");
            }

            return new CostAnalysisPeriodRange
            {
                StartDate = startDate.Value,
                EndDate = endDate.Value
            };
        }
    }
}
