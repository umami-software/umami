import { Column, FloatingTooltip, Row, StatusLight, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';

export function ChartTooltip({
  title,
  color,
  value,
}: {
  title?: string;
  color?: string;
  value?: ReactNode;
}) {
  return (
    <FloatingTooltip>
      <Column
        gap="3"
        padding="4"
        borderRadius="md"
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '5.25px',
          color: 'white',
          gap: '10.5px',
          padding: '14px',
        }}
      >
        {title && (
          <Text size="sm" style={{ fontSize: '12.25px', lineHeight: '17.5px' }}>
            {title}
          </Text>
        )}
        <Row alignItems="center">
          <StatusLight color={color}>
            <Text size="sm" style={{ fontSize: '12.25px', lineHeight: '17.5px' }}>
              {value}
            </Text>
          </StatusLight>
        </Row>
      </Column>
    </FloatingTooltip>
  );
}
