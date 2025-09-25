interface ProjectionParams {
  initialValue: number;
  monthlyContribution: number;
  yearlyRate: number;
  startYear: number;
  endYear: number;
}

interface YearProjection {
  year: number;
  totalValue: number;
}

export function calculatePatrimonialProjection({
  initialValue,
  monthlyContribution,
  yearlyRate,
  startYear,
  endYear,
}: ProjectionParams): YearProjection[] {
  const projections: YearProjection[] = [];
  let currentValue = initialValue;

  for (let year = startYear; year <= endYear; year++) {
    currentValue += monthlyContribution * 12;
    currentValue *= (1 + yearlyRate);

    projections.push({
      year: year,
      totalValue: parseFloat(currentValue.toFixed(2)),
    });
  }

  return projections;
}
