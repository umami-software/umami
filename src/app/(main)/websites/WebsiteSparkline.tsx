import { useTheme } from '@umami/react-zen';
import { useMemo } from 'react';
import { useMessages } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';

export function WebsiteSparkline({
  values = [],
  total = 0,
  isLoading = false,
}: {
  values?: number[];
  total?: number;
  isLoading?: boolean;
}) {
  const { theme } = useTheme();
  const { t, labels } = useMessages();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const tooltipLabel = `${total.toLocaleString()} ${t(labels.visitors).toLocaleLowerCase()}`;

  const points = useMemo(() => {
    if (!values.length) {
      return '';
    }

    const width = 96;
    const height = 24;
    const padding = 2;
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    return values
      .map((value, index) => {
        const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
        const y =
          height - padding - ((value - min) / range) * Math.max(height - padding * 2, 1);

        return `${x},${y}`;
      })
      .join(' ');
  }, [values]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 88,
          height: 24,
          borderRadius: 9999,
          background: 'var(--surface-sunken)',
        }}
      />
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 88, cursor: 'default' }} title={tooltipLabel}>
      <svg
        width="100%"
        height="24"
        viewBox="0 0 96 24"
        preserveAspectRatio="none"
        role="img"
        aria-label={tooltipLabel}
        style={{ display: 'block' }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={colors.chart.visitors.borderColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
