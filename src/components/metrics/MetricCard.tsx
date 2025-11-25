import { Text, Column } from '@umami/react-zen';
import { useSpring } from '@react-spring/web';
import { formatNumber } from '@/lib/format';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
  labelSize?: '0' | '1' | '2' | '3' | '4';
  valueSize?: '4' | '5' | '6' | '7' | '8' | '9';
  labelWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  valueWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  labelColor?: string;
  valueColor?: string;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
  labelSize,
  valueSize,
  labelWeight,
  valueWeight,
  labelColor,
  valueColor,
}: MetricCardProps) => {
  const diff = value - change;
  const pct = ((value - diff) / diff) * 100;
  const props = useSpring({ x: Number(value) || 0, from: { x: 0 } });
  const changeProps = useSpring({ x: Number(pct) || 0, from: { x: 0 } });

  return (
    <Column
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius="3"
      backgroundColor
      border
    >
      {showLabel && (
        <Text
          {...(labelSize && { size: labelSize })}
          weight={labelWeight || 'bold'}
          wrap="nowrap"
          {...(labelColor && { style: { color: labelColor } })}
        >
          {label}
        </Text>
      )}
      <Text
        size={valueSize || '8'}
        weight={valueWeight || 'bold'}
        wrap="nowrap"
        {...(valueColor && { style: { color: valueColor } })}
      >
        <AnimatedDiv title={value?.toString()}>{props?.x?.to(x => formatValue(x))}</AnimatedDiv>
      </Text>
      {showChange && (
        <ChangeLabel value={change} title={formatValue(change)} reverseColors={reverseColors}>
          <AnimatedDiv>{changeProps?.x?.to(x => `${Math.abs(~~x)}%`)}</AnimatedDiv>
        </ChangeLabel>
      )}
    </Column>
  );
};
