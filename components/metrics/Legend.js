import React from 'react';
import classNames from 'classnames';
import Dot from 'components/common/Dot';
import useLocale from 'hooks/useLocale';
import styles from './Legend.module.css';
import useForceUpdate from '../../hooks/useForceUpdate';

export default function Legend({ chart }) {
  const [locale] = useLocale();
  const forceUpdate = useForceUpdate();

  function handleClick(index) {
    const meta = chart.getDatasetMeta(index);

    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;

    chart.update();

    forceUpdate();
  }

  if (!chart?.legend?.legendItems.find(({ text }) => text)) {
    return null;
  }

  return (
    <div className={styles.legend}>
      {chart.legend.legendItems.map(({ text, fillStyle, datasetIndex, hidden }) => (
        <div
          key={text}
          className={classNames(styles.label, { [styles.hidden]: hidden })}
          onClick={() => handleClick(datasetIndex)}
        >
          <Dot color={fillStyle} />
          <span className={locale}>{text}</span>
        </div>
      ))}
    </div>
  );
}
