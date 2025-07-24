import { Row, StatusLight, Text } from '@umami/react-zen';
import { colord } from 'colord';
import { LegendItem } from 'chart.js/auto';

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
              <Text size="2" color={hidden ? 'disabled' : undefined} wrap="nowrap">
                {text}
              </Text>
            </StatusLight>
          </Row>
        );
      })}
    </Row>
  );
}
