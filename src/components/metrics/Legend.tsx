import { useEffect } from 'react';
import { StatusLight } from 'react-basics';
import { colord } from 'colord';
import classNames from 'classnames';
import { useLocale } from 'components/hooks';
import { useForceUpdate } from 'components/hooks';
import styles from './Legend.module.css';

export function Legend({
  items = [],
  onClick,
}: {
  items: any[];
  onClick: (index: number) => void;
}) {
  const { locale } = useLocale();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    forceUpdate();
  }, [locale, forceUpdate]);

  if (!items.find(({ text }) => text)) {
    return null;
  }

  return (
    <div className={styles.legend}>
      {items.map(({ text, fillStyle, datasetIndex, hidden }) => {
        const color = colord(fillStyle);

        return (
          <div
            key={text}
            className={classNames(styles.label, { [styles.hidden]: hidden })}
            onClick={() => onClick(datasetIndex)}
          >
            <StatusLight color={color.alpha(color.alpha() + 0.2).toHex()}>
              <span className={locale}>{text}</span>
            </StatusLight>
          </div>
        );
      })}
    </div>
  );
}

export default Legend;
