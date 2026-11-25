export interface PropertyTotal {
  value: string;
  total: number;
}

// Percentages are taken against the total of every value, then the rows are cut to the limit,
// so a top 10 out of many values shows each value's real share.
export function getPropertyTableData(totals: PropertyTotal[], limit?: number) {
  const sum = totals.reduce((acc, { total }) => acc + total, 0);

  if (!totals.length || sum === 0) {
    return [];
  }

  return (limit ? totals.slice(0, limit) : totals).map(({ value, total }) => ({
    label: value,
    count: total,
    percent: 100 * (total / sum),
  }));
}
