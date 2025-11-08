import { ReactNode } from 'react';
import { Column, Row, StatusLight, FloatingTooltip } from '@umami/react-zen';

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
      <Column gap="3" fontSize="1">
        {title && <Row alignItems="center">{title}</Row>}
        <Row alignItems="center">
          <StatusLight color={color}>{value}</StatusLight>
        </Row>
      </Column>
    </FloatingTooltip>
  );
}
