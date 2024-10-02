import classNames from 'classnames';
import { useSpring, animated } from '@react-spring/web';
import { formatNumber } from 'lib/format';
import ChangeLabel from 'components/metrics/ChangeLabel';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
  showPrevious?: boolean;
  className?: string;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
  showPrevious = false,
  className,
}: MetricCardProps) => {
  const diff = value - change;
  const pct = ((value - diff) / diff) * 100;
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(pct) || 0, from: { x: 0 } });
  const prevProps = useSpring({ x: Number(diff) || 0, from: { x: 0 } });

  return (
    <div className={classNames(styles.card, className, showPrevious && styles.compare)}>
      {showLabel && <div className={styles.label}>{label}</div>}
      <animated.div className={styles.value} title={value?.toString()}>
        {props?.x?.to(x => formatValue(x))}
      </animated.div>
      {showChange && (
        <ChangeLabel
          className={styles.change}
          value={change}
          title={formatValue(change)}
          reverseColors={reverseColors}
        >
          <animated.span>{changeProps?.x?.to(x => `${Math.abs(~~x)}%`)}</animated.span>
        </ChangeLabel>
      )}
      {showPrevious && (
        <animated.div className={classNames(styles.value, styles.prev)} title={diff.toString()}>
          {prevProps?.x?.to(x => formatValue(x))}
        </animated.div>
      )}
    </div>
  );
};

export default MetricCard;
