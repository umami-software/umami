import React, { useState } from 'react';
import { getDateRange } from 'lib/date';

const filterOptions = ['24hour', '7day', '30day', '60day', '90day'];

export default function DateFilter({ onChange }) {
  const [selected, setSelected] = useState('7day');

  function handleChange(e) {
    const value = e.target.value;
    setSelected(value);
    onChange(getDateRange(value));
  }

  return (
    <select value={selected} onChange={handleChange}>
      {filterOptions.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
