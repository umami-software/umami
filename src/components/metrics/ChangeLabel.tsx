import classNames from 'classnames';
import { Icon, Text } from '@umami/react-zen';
import { HTMLAttributes, ReactNode } from 'react';
import { Arrow } from '@/components/icons';
import styles from './ChangeLabel.module.css';

export function ChangeLabel({
  value,
  size,
  reverseColors,
  className,
  children,
  ...props
}: {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  reverseColors?: boolean;
  showPercentage?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const positive = value >= 0;
  const negative = value < 0;
  const neutral = value === 0 || isNaN(value);
  const good = reverseColors ? negative : positive;

  return (
    <div
      {...props}
      className={classNames(styles.label, className, {
        [styles.positive]: good,
        [styles.negative]: !good,
        [styles.neutral]: neutral,
      })}
    >
      {!neutral && (
        <Icon rotate={positive ? -90 : 90} size={size}>
          <Arrow />
        </Icon>
      )}
      <Text>{children || value}</Text>
    </div>
  );
}
