import React from 'react';
import { getDateRange } from 'lib/date';
import DropDown from './DropDown';

const filterOptions = [
  { label: 'Last 24 hours', value: '24hour' },
  { label: 'Last 7 days', value: '7day' },
  { label: 'Last 30 days', value: '30day' },
  { label: 'Last 90 days', value: '90day' },
  { label: 'Today', value: '1day' },
  { label: 'This week', value: '1week' },
  { label: 'This month', value: '1month' },
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
