import classNames from 'classnames';
import { Icon, Icons } from 'react-basics';
import { ReactNode } from 'react';
import styles from './ChangeLabel.module.css';

export function ChangeLabel({
  value,
  size,
  reverseColors,
  className,
  children,
}: {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  reverseColors?: boolean;
  showPercentage?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const positive = value * (reverseColors ? -1 : 1) >= 0;
  const negative = value * (reverseColors ? -1 : 1) < 0;
  const isNew = isNaN(value);

  return (
    <div
      className={classNames(styles.label, className, {
        [styles.positive]: positive,
        [styles.negative]: negative,
        [styles.neutral]: value === 0,
        [styles.new]: isNew,
      })}
      title={value.toString()}
    >
      {!isNew && (
        <Icon rotate={value === 0 ? 0 : positive || reverseColors ? -45 : 45} size={size}>
          <Icons.ArrowRight />
        </Icon>
      )}
      {children || value}
    </div>
  );
}

export default ChangeLabel;
