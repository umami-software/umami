import React from 'react';
import { getDateRange } from 'lib/date';
import DropDown from './DropDown';
import { FormattedMessage } from 'react-intl';

const filterOptions = [
  {
    label: (
      <FormattedMessage id="label.last-hours" defaultMessage="Last {x} hours" values={{ x: 24 }} />
    ),
    value: '24hour',
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 7 }} />
    ),
    value: '7day',
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 30 }} />
    ),
    value: '30day',
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 90 }} />
    ),
    value: '90day',
  },
  { label: <FormattedMessage id="label.today" defaultMessage="Today" />, value: '1day' },
  { label: <FormattedMessage id="label.this-week" defaultMessage="This week" />, value: '1week' },
  {
    label: <FormattedMessage id="label.this-month" defaultMessage="This month" />,
    value: '1month',
  },
  { label: <FormattedMessage id="label.this-year" defaultMessage="This year" />, value: '1year' },
];

export default function DateFilter({ value, onChange, className }) {
  function handleChange(value) {
    onChange(getDateRange(value));
  }

  return (
    <DropDown className={className} value={value} options={filterOptions} onChange={handleChange} />
  );
}
