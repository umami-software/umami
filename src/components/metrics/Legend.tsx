import { Row, StatusLight, Text } from '@umami/react-zen';
import { colord } from 'colord';

export interface LegendItem {
  text: string;
  color?: string;
  hidden?: boolean;
}

export function Legend({
  items = [],
  onClick,
}: {
  items: LegendItem[];
  onClick?: (item: LegendItem) => void;
}) {
  if (!items.find(({ text }) => text)) {
    return null;
  }

  return (
    <Row gap wrap="wrap" justifyContent="center">
      {items.map(item => {
        const { text, color: fill, hidden } = item;
        const color = colord(fill || '#999');

        return (
          <Row
            key={text}
            onClick={onClick ? () => onClick(item) : undefined}
            style={onClick ? { cursor: 'pointer' } : undefined}
          >
            <StatusLight color={color.alpha(color.alpha() + 0.2).toHex()}>
              <Text
                size="sm"
                color={hidden ? 'muted' : undefined}
                truncate={true}
                style={{ maxWidth: '300px' }}
              >
                {text}
              </Text>
            </StatusLight>
          </Row>
        );
      })}
    </Row>
  );
}
