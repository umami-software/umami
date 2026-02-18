import { useSpring } from '@react-spring/web';
import { Column, Focusable, Icon, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { Info } from 'lucide-react';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { formatNumber } from '@/lib/format';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
  tooltip?: string;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
  tooltip,
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
          weight="bold"
          wrap="nowrap"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {label}
          {tooltip && (
            <TooltipTrigger delay={0}>
              <Focusable aria-label="More info">
                <Icon size="xs" style={{ cursor: 'pointer' }}>
                  <Info />
                </Icon>
              </Focusable>
              <Tooltip>{tooltip}</Tooltip>
            </TooltipTrigger>
          )}
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
    </Column>
  );
};
