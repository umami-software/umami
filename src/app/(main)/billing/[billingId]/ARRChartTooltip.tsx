import { Column, Row, Text } from '@umami/react-zen';
import { createPortal } from 'react-dom';
import { YOY_GROWTH_COLOR } from './arr';

export interface ARRChartTooltipItem {
  key: string;
  label: string;
  color: string;
  value: string;
}

export interface ARRChartTooltipProps {
  position: { x: number; y: number };
  title: string;
  items: ARRChartTooltipItem[];
  activeKey?: string;
  total: string;
  growth?: string | null;
}

const MUTED = 'rgba(255,255,255,0.7)';
const DIVIDER = '1px solid rgba(255,255,255,0.15)';

export function ARRChartTooltip({
  position,
  title,
  items,
  activeKey,
  total,
  growth,
}: ARRChartTooltipProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(calc(-100% - 12px), -50%)',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      <Column
        gap="0.5"
        padding="4"
        borderRadius="lg"
        style={{ backgroundColor: 'rgba(13,15,23,0.95)', color: 'white', width: '300px' }}
      >
        <Text weight="bold" size="lg" style={{ color: 'white' }}>
          {title}
        </Text>
        <Column gap="0.5" marginTop="1">
          {items.map(({ key, label, color, value }) => (
            <Row
              key={key}
              justifyContent="space-between"
              alignItems="center"
              gap="6"
              paddingX="2"
              paddingY="0.5"
              borderRadius="md"
              style={{
                backgroundColor: key === activeKey ? 'rgba(255,255,255,0.14)' : 'transparent',
              }}
            >
              <Row alignItems="center" gap="2" style={{ minWidth: 0 }}>
                <Swatch color={color} />
                <Text style={{ color: MUTED, whiteSpace: 'nowrap' }}>{label}</Text>
              </Row>
              <Text style={{ color: 'white', whiteSpace: 'nowrap' }}>{value}</Text>
            </Row>
          ))}
        </Column>
        <Row
          justifyContent="space-between"
          alignItems="center"
          marginTop="1"
          paddingTop="2"
          paddingX="2"
          style={{ borderTop: DIVIDER }}
        >
          <Text style={{ color: MUTED }}>Total ARR</Text>
          <Text style={{ color: 'white' }}>{total}</Text>
        </Row>
        {growth != null && (
          <Row justifyContent="space-between" alignItems="center" marginTop="1" paddingX="2">
            <Row alignItems="center" gap="2">
              <Swatch color={YOY_GROWTH_COLOR} />
              <Text style={{ color: MUTED }}>YoY Growth</Text>
            </Row>
            <Text style={{ color: 'white' }}>{growth}</Text>
          </Row>
        )}
      </Column>
    </div>,
    document.body,
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <div
      style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, flexShrink: 0 }}
    />
  );
}
