import { Icon, Text, Row, RowProps } from '@umami/react-zen';
import { ReactNode } from 'react';
import { ArrowRight } from '@/components/icons';

const STYLES = {
  positive: {
    color: `var(--success-color)`,
    background: `color-mix(in srgb, var(--success-color), var(--background-color) 95%)`,
  },
  negative: {
    color: `var(--danger-color)`,
    background: `color-mix(in srgb, var(--danger-color), var(--background-color) 95%)`,
  },
  neutral: {
    color: `var(--font-color-muted)`,
    background: `var(--base-color-2)`,
  },
};

export function ChangeLabel({
  value,
  size,
  reverseColors,
  children,
  ...props
}: {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  reverseColors?: boolean;
  showPercentage?: boolean;
  children?: ReactNode;
} & RowProps) {
  const positive = value >= 0;
  const negative = value < 0;
  const neutral = value === 0 || isNaN(value);
  const good = reverseColors ? negative : positive;

  const style =
    STYLES[good && 'positive'] || STYLES[!good && 'negative'] || STYLES[neutral && 'neutral'];

  return (
    <Row
      {...props}
      style={style}
      alignItems="center"
      alignSelf="flex-start"
      paddingX="2"
      paddingY="1"
      gap="2"
    >
      {!neutral && (
        <Icon rotate={positive ? -90 : 90} size={size}>
          <ArrowRight />
        </Icon>
      )}
      <Text>{children || value}</Text>
    </Row>
  );
}
