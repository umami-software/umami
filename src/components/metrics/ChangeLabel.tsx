import { Badge } from '@umami/react-zen';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowDown, ArrowUp } from '@/components/icons';

export function ChangeLabel({
  value,
  reverseColors,
  className,
  children,
  ...props
}: {
  value: number;
  reverseColors?: boolean;
  children?: ReactNode;
} & Omit<ComponentProps<typeof Badge>, 'children' | 'variant'>) {
  const neutral = value === 0 || Number.isNaN(value);
  const positive = value > 0;
  const good = reverseColors ? !positive : positive;

  return (
    <Badge
      {...props}
      variant={neutral || good ? 'secondary' : 'destructive'}
      className={[!neutral && good && 'badge-success', className].filter(Boolean).join(' ')}
    >
      {!neutral &&
        (positive ? <ArrowUp data-icon="inline-start" /> : <ArrowDown data-icon="inline-start" />)}
      {children ?? value}
    </Badge>
  );
}
