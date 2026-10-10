import { Button, Column, Icon, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { useSpring, useTransform } from 'motion/react';
import { type KeyboardEvent, type ReactNode, useEffect } from 'react';
import { AnimatedDiv } from '@/components/common/AnimatedDiv';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { Info } from '@/components/icons';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { useMetricsBarJoined } from '@/components/metrics/MetricsBar';
import { formatNumber } from '@/lib/format';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  value: number;
  previousValue?: number;
  change?: number;
  label?: string;
  tooltip?: ReactNode;
  reverseColors?: boolean;
  formatValue?: (n: any) => string;
  showLabel?: boolean;
  showChange?: boolean;
  /** Draw the card's own border and background. Defaults to off inside a joined `MetricsBar`, which provides them. */
  bordered?: boolean;
  /** Content shown under the value, such as a rating badge. */
  footer?: ReactNode;
  /** Makes the card selectable, e.g. to choose which metric a chart shows. */
  onClick?: () => void;
  selected?: boolean;
}

export const MetricCard = ({
  value = 0,
  change = 0,
  label,
  tooltip,
  reverseColors = false,
  formatValue = formatNumber,
  showLabel = true,
  showChange = false,
  bordered: borderedProp,
  footer,
  onClick,
  selected = false,
}: MetricCardProps) => {
  const joined = useMetricsBarJoined();
  const bordered = borderedProp ?? !joined;
  const reducedMotion = useReducedMotion();
  const diff = value - change;
  const pct = diff !== 0 ? ((value - diff) / diff) * 100 : value !== 0 ? 100 : 0;
  const x = Number(value) || 0;
  const p = Number(pct) || 0;
  const xSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const pctSpring = useSpring(0, { stiffness: 170, damping: 26 });
  const valueText = useTransform(xSpring, n => formatValue(n));
  const pctText = useTransform(pctSpring, n => `${Math.abs(~~n)}%`);

  useEffect(() => {
    if (reducedMotion) xSpring.jump(x);
    else xSpring.set(x);
  }, [x, xSpring, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) pctSpring.jump(p);
    else pctSpring.set(p);
  }, [p, pctSpring, reducedMotion]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Column
      className={
        onClick
          ? [styles.clickable, bordered && styles.bordered, selected && styles.selected]
              .filter(Boolean)
              .join(' ')
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius={bordered ? true : undefined}
      backgroundColor={bordered ? 'surface' : undefined}
      border={bordered ? true : undefined}
      gap="2"
    >
      {showLabel && (
        <Row justifyContent="space-between" alignItems="flex-start">
          <Text weight="bold" wrap="nowrap">
            {label}
          </Text>
          {tooltip && (
            <TooltipTrigger delay={0}>
              <Button size="sm" variant="quiet">
                <Icon size="sm">
                  <Info />
                </Icon>
              </Button>
              <Tooltip placement="top">{tooltip}</Tooltip>
            </TooltipTrigger>
          )}
        </Row>
      )}
      <Text size="4xl" weight="bold" wrap="nowrap">
        <AnimatedDiv title={value?.toString()}>
          {reducedMotion ? formatValue(x) : valueText}
        </AnimatedDiv>
      </Text>
      {showChange && (
        <ChangeLabel value={change} title={formatValue(change)} reverseColors={reverseColors}>
          <AnimatedDiv>{reducedMotion ? `${Math.abs(~~p)}%` : pctText}</AnimatedDiv>
        </ChangeLabel>
      )}
      {footer}
    </Column>
  );
};
