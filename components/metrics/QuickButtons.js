import React from 'react';
import ButtonGroup from 'components/common/ButtonGroup';
import { getDateRange } from 'lib/date';
import styles from './QuickButtons.module.css';

const options = [
  { label: '24h', value: '24hour' },
  { label: '7d', value: '7day' },
  { label: '30d', value: '30day' },
];

export default function QuickButtons({ value, onChange }) {
  const selectedItem = options.find(item => item.value === value)?.value;

  function handleClick(selected) {
    if (selected !== value) {
      onChange(getDateRange(selected));
    }
  }

  return (
    <ButtonGroup
      size="xsmall"
      className={styles.buttons}
      items={options}
      selectedItem={selectedItem}
      onClick={handleClick}
    />
  );
}
