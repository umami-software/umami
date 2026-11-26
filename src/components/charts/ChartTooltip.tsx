import type { CSSProperties, ReactNode } from 'react';

/**
 * One row of Zen's ChartTooltipContent, for its `formatter` prop: Zen shows values with
 * toLocaleString, so rows that need their own value format (currency, durations) render this.
 * It matches Zen's default row (dot indicator, label, value) and only uses class names from
 * Zen's ChartTooltipContent, which are in its precompiled stylesheet.
 */
export function ChartTooltipRow({
  color,
  label,
  value,
}: {
  color?: string;
  label?: ReactNode;
  value?: ReactNode;
}) {
  return (
    <>
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"
        style={{ '--color-bg': color, '--color-border': color } as CSSProperties}
      />
      <div className="flex flex-1 items-center justify-between leading-none">
        <span className="text-muted-foreground">{label}</span>
        <span
          className="font-mono font-medium text-foreground tabular-nums"
          style={{ marginLeft: 16 }}
        >
          {value}
        </span>
      </div>
    </>
  );
}
