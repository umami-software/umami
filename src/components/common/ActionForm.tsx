import { Row, Column, Text } from '@umami/react-zen';

export function ActionForm({ label, description, children }) {
  return (
    <Row alignItems="center" justifyContent="space-between" gap>
      <Column gap="2">
        <Text weight="bold">{label}</Text>
        <Text color="muted">{description}</Text>
      </Column>
      <Row alignItems="center" gap>
        {children}
      </Row>
    </Row>
  );
}
