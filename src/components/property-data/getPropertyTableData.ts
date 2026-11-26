export interface PropertyTotal {
  value: string;
  total: number;
}

// Percentages are taken against grandTotal (the server's total for every value, including those
// past its top-100 limit) when given, otherwise against the sum of the rows. The rows are then cut
// to the limit, so a top 10 out of many values shows each value's real share.
export function getPropertyTableData(totals: PropertyTotal[], limit?: number, grandTotal?: number) {
  const rowsSum = totals.reduce((acc, { total }) => acc + total, 0);
  const sum = grandTotal && grandTotal >= rowsSum ? grandTotal : rowsSum;

  if (!totals.length || sum === 0) {
    return [];
  }

  return (limit ? totals.slice(0, limit) : totals).map(({ value, total }) => ({
    label: value,
    count: total,
    percent: 100 * (total / sum),
  }));
}

// What the pie's "Other" slice holds: everything not in the displayed rows, including values the
// server left out past its top-100 limit when grandTotal is given. Like getPropertyTableData, a
// limit of 0 or undefined shows every row.
export function getOtherTotal(totals: PropertyTotal[], limit?: number, grandTotal?: number) {
  const rowsSum = totals.reduce((acc, { total }) => acc + total, 0);
  const sum = grandTotal && grandTotal >= rowsSum ? grandTotal : rowsSum;
  const shown = (limit ? totals.slice(0, limit) : totals).reduce(
    (acc, { total }) => acc + total,
    0,
  );

  return sum - shown;
}
