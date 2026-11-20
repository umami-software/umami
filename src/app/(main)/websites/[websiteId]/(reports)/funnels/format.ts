// Whole numbers, with one decimal below 1% where rounding would hide real differences.
export function formatPercent(fraction: number) {
  const percent = (Number.isFinite(fraction) ? fraction : 0) * 100;

  return `${percent < 1 ? Number(percent.toFixed(1)) : Math.round(percent)}%`;
}
