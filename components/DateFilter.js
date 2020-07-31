import React from 'react';
import { getDateRange } from 'lib/date';
import DropDown from './DropDown';

const filterOptions = [
  { label: 'Last 24 hours', value: '24hour' },
  { label: 'Last 7 days', value: '7day' },
  { label: 'Last 30 days', value: '30day' },
  { label: 'Last 90 days', value: '90day' },
];

export default function DateFilter({ value, onChange }) {
  function handleChange(value) {
    onChange(getDateRange(value));
  }

  return <DropDown value={value} options={filterOptions} onChange={handleChange} />;
}
