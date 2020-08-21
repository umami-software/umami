import React from 'react';
import classNames from 'classnames';
import Button from '../common/Button';
import { getDateRange } from 'lib/date';
import styles from './QuickButtons.module.css';

const options = {
  '24hour': '24h',
  '7day': '7d',
  '30day': '30d',
};

export default function QuickButtons({ value, onChange }) {
  function handleClick(value) {
    onChange(getDateRange(value));
  }

  return (
    <div className={styles.buttons}>
      {Object.keys(options).map(key => (
        <Button
          key={key}
          className={classNames(styles.button, { [styles.active]: value === key })}
          onClick={() => handleClick(key)}
        >
          {options[key]}
        </Button>
      ))}
    </div>
  );
}
