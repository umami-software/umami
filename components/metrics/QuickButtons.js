import React from 'react';
import ButtonGroup from 'components/common/ButtonGroup';
import { getDateRange } from 'lib/date';
import styles from './QuickButtons.module.css';

const options = {
  '24h': '24hour',
  '7d': '7day',
  '30d': '30day',
};

export default function QuickButtons({ value, onChange }) {
  const selectedItem = Object.keys(options).find(key => options[key] === value);

  function handleClick(value) {
    onChange(getDateRange(options[value]));
  }

  return (
    <ButtonGroup
      size="xsmall"
      className={styles.buttons}
      items={Object.keys(options)}
      selectedItem={selectedItem}
      onClick={handleClick}
    />
  );
}
