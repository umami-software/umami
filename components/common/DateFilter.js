import React from 'react';
import { getDateRange } from 'lib/date';
import DropDown from './DropDown';

const filterOptions = [
  { label: 'Today', value: '1day' },
  { label: 'Last 7 days', value: '7day' },
  { label: 'This week', value: '1week' },
  { label: 'Last 30 days', value: '30day' },
  { label: 'This month', value: '1month' },
  { label: 'Last 90 days', value: '90day' },
  { label: 'This year', value: '1year' },
];

export default function DateFilter({ value, onChange, className }) {
  function handleChange(value) {
    onChange(getDateRange(value));
  }

  return (
    <DropDown className={className} value={value} options={filterOptions} onChange={handleChange} />
  );
}
