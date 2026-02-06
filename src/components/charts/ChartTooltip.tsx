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
        backgroundColor="surface-inverted"
        color="inverted"
        padding="4"
        borderRadius="md"
      >
        {title && <Text size="sm">{title}</Text>}
        <Row alignItems="center">
          <StatusLight color={color}>
            <Text size="sm">{value}</Text>
          </StatusLight>
        </Row>
      </Column>
    </FloatingTooltip>
  );
}
