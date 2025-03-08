import { Row, Column, Text } from '@umami/react-zen';

export function ActionForm({ label, description, children }) {
  return (
    <Row padding="6" borderSize="1" borderRadius="3" justifyContent="space-between" shadow="2">
      <Column>
        <Text weight="bold">{label}</Text>
        <Text>{description}</Text>
      </Column>
      <Row gap="3" alignItems="center">
        {children}
      </Row>
    </Row>
  );
}
