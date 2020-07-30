import React, { useState } from 'react';
import classNames from 'classnames';
import { getDateRange } from 'lib/date';
import styles from './QuickButtons.module.css';

const options = {
  '24hour': '24h',
  '7day': '7d',
  '30day': '30d',
};

export default function QuickButtons({ onChange }) {
  const [active, setActive] = useState('7day');

  function handleClick(value) {
    setActive(value);
    onChange(getDateRange(value));
  }

  return (
    <div className={styles.buttons}>
      {Object.keys(options).map(key => (
        <div
          key={key}
          className={classNames(styles.button, { [styles.active]: active === key })}
          onClick={() => handleClick(key)}
        >
          {options[key]}
        </div>
      ))}
    </div>
  );
}
