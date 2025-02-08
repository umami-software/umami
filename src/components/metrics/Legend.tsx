import { StatusLight } from 'react-basics';
import { colord } from 'colord';
import classNames from 'classnames';
import { LegendItem } from 'chart.js/auto';
import styles from './Legend.module.css';

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
    <div className={styles.legend}>
      {items.map(item => {
        const { text, fillStyle, hidden } = item;
        const color = colord(fillStyle);

        return (
          <div
            key={text}
            className={classNames(styles.label, { [styles.hidden]: hidden })}
            onClick={() => onClick(item)}
          >
            <StatusLight color={color.alpha(color.alpha() + 0.2).toHex()}>{text}</StatusLight>
          </div>
        );
      })}
    </div>
  );
}

export default Legend;
