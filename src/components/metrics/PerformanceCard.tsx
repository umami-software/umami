import { useSpring } from '@react-spring/web';
import { Column, Text } from '@umami/react-zen';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { useMessages } from '@/components/hooks';
import { WEB_VITALS_THRESHOLDS } from '@/lib/constants';
import { formatNumber } from '@/lib/format';
import styles from './PerformanceCard.module.css';

export interface PerformanceCardProps {
  metric: 'lcp' | 'inp' | 'cls' | 'fcp' | 'ttfb';
  value: number;
  label: string;
  formatValue?: (n: any) => string;
  onClick?: () => void;
  selected?: boolean;
}

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = WEB_VITALS_THRESHOLDS[metric as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!threshold || value <= 0) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export const PerformanceCard = ({
  metric,
  value = 0,
  label,
  formatValue = formatNumber,
  onClick,
  selected = false,
}: PerformanceCardProps) => {
  const { t, labels } = useMessages();
  const rating = getRating(metric, value);
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });

  return (
    <Column
      className={`${styles.card} ${styles[rating]} ${selected ? styles.selected : ''}`}
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius
      backgroundColor="surface-base"
      border
      gap="4"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <Text weight="bold" wrap="nowrap">
        {label}
      </Text>
      <Text size="4xl" weight="bold" wrap="nowrap">
        <AnimatedDiv title={value?.toString()}>{props?.x?.to(x => formatValue(x))}</AnimatedDiv>
      </Text>
      <Text size="sm" className={styles.rating}>
        {t(labels[rating === 'needs-improvement' ? 'needsImprovement' : rating])}
      </Text>
    </Column>
  );
};
