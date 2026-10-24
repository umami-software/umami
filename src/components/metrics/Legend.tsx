import { Row, StatusLight, Text } from '@umami/react-zen';
import type { LegendItem } from 'chart.js/auto';
import { colord } from 'colord';
import styles from './Legend.module.css';

export function Legend({
  items = [],
  onClick,
}: {
  items: any[];
  onClick: (index: LegendItem, shiftkey: boolean) => void;
}) {
  if (!items.find(({ text }) => text)) {
    return null;
  }

  return (
    <Row gap wrap="wrap" justifyContent="center">
      {items.map(item => {
        const { text, fillStyle, hidden } = item;
        const color = hidden ? colord(fillStyle).desaturate(1) : colord(fillStyle);

        return (
          <Row key={text} onClick={(e: React.MouseEvent) => onClick(item, e.shiftKey)}>
            <StatusLight className={styles.statusLight} color={color.alpha(color.alpha() + 0.2).toHex()} >
              <span className={styles.hiddenMark}>{hidden ? 'X' : ''}</span>
              <Text
                size="sm"
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
    </Row >
  );
}
