import { endOfYear, isSameDay } from 'date-fns';
import { useState } from 'react';
import { Icon, Modal, Dropdown, Item } from 'react-basics';
import { useIntl, defineMessages } from 'react-intl';
import DatePickerForm from 'components/metrics/DatePickerForm';
import useLocale from 'hooks/useLocale';
import { dateFormat } from 'lib/date';
import Calendar from 'assets/calendar-alt.svg';

const messages = defineMessages({
  today: { id: 'label.today', defaultMessage: 'Today' },
  lastHours: { id: 'label.last-hours', defaultMessage: 'Last {x} hours' },
  yesterday: { id: 'label.yesterday', defaultMessage: 'Yesterday' },
  thisWeek: { id: 'label.this-week', defaultMessage: 'This week' },
  lastDays: { id: 'label.last-days', defaultMessage: 'Last {x} days' },
  thisMonth: { id: 'label.this-month', defaultMessage: 'This month' },
  thisYear: { id: 'label.this-year', defaultMessage: 'This year' },
  allTime: { id: 'label.all-time', defaultMessage: 'All time' },
  customRange: { id: 'label.custom-range', defaultMessage: 'Custom-range' },
});

function DateFilter({ value, startDate, endDate, onChange, className }) {
  const { formatMessage } = useIntl();
  const [showPicker, setShowPicker] = useState(false);

  const options = [
    { label: formatMessage(messages.today), value: '1day' },
    {
      label: formatMessage(messages.lastHours, { x: 24 }),
      value: '24hour',
    },
    {
      label: formatMessage(messages.yesterday),
      value: '-1day',
    },
    {
      label: formatMessage(messages.thisWeek),
      value: '1week',
      divider: true,
    },
    {
      label: formatMessage(messages.lastDays, { x: 7 }),
      value: '7day',
    },
    {
      label: formatMessage(messages.thisMonth),
      value: '1month',
      divider: true,
    },
    {
      label: formatMessage(messages.lastDays, { x: 30 }),
      value: '30day',
    },
    {
      label: formatMessage(messages.lastDays, { x: 90 }),
      value: '90day',
    },
    { label: formatMessage(messages.thisYear), value: '1year' },
    {
      label: formatMessage(messages.allTime),
      value: 'all',
      divider: true,
    },
    {
      label: formatMessage(messages.customRange),
      value: 'custom',
      divider: true,
    },
  ];

  const renderValue = value => {
    return value === 'custom' ? (
      <CustomRange startDate={startDate} endDate={endDate} onClick={() => handleChange('custom')} />
    ) : (
      options.find(e => e.value === value).label
    );
  };

  const handleChange = async value => {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    onChange(value);
  };

  const handlePickerChange = value => {
    setShowPicker(false);
    onChange(value);
  };

  const handleClose = () => setShowPicker(false);

  return (
    <>
      <Dropdown
        className={className}
        items={options}
        renderValue={renderValue}
        value={value}
        onChange={handleChange}
      >
        {({ label, value }) => <Item key={value}>{label}</Item>}
      </Dropdown>
      {showPicker && (
        <Modal onClose={handleClose}>
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

export default DateFilter;
