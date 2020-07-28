import React, { useState } from 'react';
import { getDateRange } from 'lib/date';

const filterOptions = ['24h', '7d', '30d'];

export default function DateFilter({ onChange }) {
  const [selected, setSelected] = useState('7d');

  function handleChange(e) {
    const value = e.target.value;
    setSelected(value);
    onChange(getDateRange(value));
  }

  return (
    <select value={selected} onChange={handleChange}>
      {filterOptions.map(option => (
        <option name={option}>{option}</option>
      ))}
    </select>
  );
}
