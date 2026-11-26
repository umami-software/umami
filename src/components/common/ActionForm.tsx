import { Column, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';

export function ActionForm({
  label,
  description,
  children,
}: {
  label?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Row alignItems="center" justifyContent="space-between" gap wrap="wrap">
      <Column gap="2">
        <Text weight="bold">{label}</Text>
        {description && <Text color="muted">{description}</Text>}
      </Column>
      <Row alignItems="center" gap maxWidth="100%">
        {children}
      </Row>
    </Row>
  );
}
