import { Row, StatusLight, Text } from '@umami/react-zen';
import type { LegendItem } from 'chart.js/auto';
import { colord } from 'colord';

export function Legend({
  items = [],
  onClick,
}: {
  items: any[];
  onClick: (index: LegendItem) => void;
}) {
  if (!items.find(({ text }) => text)) {
    return null;
  }

  return (
    <Row gap wrap="wrap" justifyContent="center">
      {items.map(item => {
        const { text, fillStyle, hidden } = item;
        const color = colord(fillStyle);

        return (
          <Row key={text} onClick={() => onClick(item)}>
            <StatusLight color={color.alpha(color.alpha() + 0.2).toHex()}>
              <Text
                size="2"
                color={hidden ? 'disabled' : undefined}
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
