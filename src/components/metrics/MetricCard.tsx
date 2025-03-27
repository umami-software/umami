import { Text, Column } from '@umami/react-zen';
import { useSpring } from '@react-spring/web';
import { formatNumber } from '@/lib/format';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
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
}: MetricCardProps) => {
  const diff = value - change;
  const pct = ((value - diff) / diff) * 100;
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(pct) || 0, from: { x: 0 } });
  const prevProps = useSpring({ x: Number(diff) || 0, from: { x: 0 } });

  return (
    <Column className={styles.card} justifyContent="center" paddingX="8">
      {showLabel && (
        <Text weight="bold" wrap="nowrap">
          {label}
        </Text>
      )}
      <Text size="8" weight="bold" wrap="nowrap">
        <AnimatedDiv title={value?.toString()}>{props?.x?.to(x => formatValue(x))}</AnimatedDiv>
      </Text>
      {showChange && (
        <ChangeLabel value={change} title={formatValue(change)} reverseColors={reverseColors}>
          <AnimatedDiv>{changeProps?.x?.to(x => `${Math.abs(~~x)}%`)}</AnimatedDiv>
        </ChangeLabel>
      )}
      {showPrevious && (
        <AnimatedDiv title={diff.toString()}>{prevProps?.x?.to(x => formatValue(x))}</AnimatedDiv>
      )}
    </Column>
  );
};
