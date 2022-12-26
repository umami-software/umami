import Calendar from 'assets/calendar-alt.svg';
import DatePickerForm from 'components/forms/DatePickerForm';
import { endOfYear, isSameDay } from 'date-fns';
import useLocale from 'hooks/useLocale';
import { dateFormat } from 'lib/date';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Icon, Modal } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import DropDown from './DropDown';

export const filterOptions = [
  { label: <FormattedMessage id="label.today" defaultMessage="Today" />, value: '1day' },
  {
    label: (
      <FormattedMessage id="label.last-hours" defaultMessage="Last {x} hours" values={{ x: 24 }} />
    ),
    value: '24hour',
  },
  {
    label: <FormattedMessage id="label.yesterday" defaultMessage="Yesterday" />,
    value: '-1day',
  },
  {
    label: <FormattedMessage id="label.this-week" defaultMessage="This week" />,
    value: '1week',
    divider: true,
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 7 }} />
    ),
    value: '7day',
  },
  {
    label: <FormattedMessage id="label.this-month" defaultMessage="This month" />,
    value: '1month',
    divider: true,
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
  { label: <FormattedMessage id="label.this-year" defaultMessage="This year" />, value: '1year' },
  {
    label: <FormattedMessage id="label.all-time" defaultMessage="All time" />,
    value: 'all',
    divider: true,
  },
  {
    label: <FormattedMessage id="label.custom-range" defaultMessage="Custom range" />,
    value: 'custom',
    divider: true,
  },
];

function DateFilter({ value, startDate, endDate, onChange, className, options }) {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue =
    value === 'custom' ? (
      <CustomRange startDate={startDate} endDate={endDate} onClick={() => handleChange('custom')} />
    ) : (
      value
    );

  async function handleChange(value) {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    onChange(value);
  }

  function handlePickerChange(value) {
    setShowPicker(false);
    onChange(value);
  }

  return (
    <>
      <DropDown
        className={className}
        value={displayValue}
        options={options || filterOptions}
        onChange={handleChange}
      />
      {showPicker && (
        <Modal>
          <DatePickerForm
            startDate={startDate}
            endDate={endDate}
            minDate={new Date(2000, 0, 1)}
            maxDate={endOfYear(new Date())}
            onChange={handlePickerChange}
            onClose={() => setShowPicker(false)}
          />
        </Modal>
      )}
    </>
  );
}

const CustomRange = ({ startDate, endDate, onClick }) => {
  const { locale } = useLocale();

  function handleClick(e) {
    e.stopPropagation();

    onClick();
  }

  return (
    <>
      <Icon className="mr-2" onClick={handleClick}>
        <Calendar />
      </Icon>
      {dateFormat(startDate, 'd LLL y', locale)}
      {!isSameDay(startDate, endDate) && ` — ${dateFormat(endDate, 'd LLL y', locale)}`}
    </>
  );
};

DateFilter.propTypes = {
  value: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default DateFilter;
