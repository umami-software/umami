import { useState } from 'react';
import { Icon, Modal, Dropdown, Item, Text, Flexbox } from 'react-basics';
import { endOfYear, isSameDay } from 'date-fns';
import DatePickerForm from 'components/metrics/DatePickerForm';
import useLocale from 'hooks/useLocale';
import { formatDate } from 'lib/date';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';

export function DateFilter({
  value,
  startDate,
  endDate,
  className,
  onChange,
  showAllTime = false,
  alignment = 'end',
}) {
  const { formatMessage, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);

  const options = [
    { label: formatMessage(labels.today), value: '1day' },
    {
      label: formatMessage(labels.lastHours, { x: 24 }),
      value: '24hour',
    },
    {
      label: formatMessage(labels.yesterday),
      value: '-1day',
    },
    {
      label: formatMessage(labels.thisWeek),
      value: '1week',
      divider: true,
    },
    {
      label: formatMessage(labels.lastDays, { x: 7 }),
      value: '7day',
    },
    {
      label: formatMessage(labels.thisMonth),
      value: '1month',
      divider: true,
    },
    {
      label: formatMessage(labels.lastDays, { x: 30 }),
      value: '30day',
    },
    {
      label: formatMessage(labels.lastDays, { x: 90 }),
      value: '90day',
    },
    { label: formatMessage(labels.thisYear), value: '1year' },
    showAllTime && {
      label: formatMessage(labels.allTime),
      value: 'all',
      divider: true,
    },
    {
      label: formatMessage(labels.customRange),
      value: 'custom',
      divider: true,
    },
  ].filter(n => n);

  const renderValue = value => {
    return value.startsWith('range') ? (
      <CustomRange startDate={startDate} endDate={endDate} onClick={() => handleChange('custom')} />
    ) : (
      options.find(e => e.value === value).label
    );
  };

  const handleChange = value => {
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
        alignment={alignment}
        placeholder={formatMessage(labels.selectDate)}
        onChange={handleChange}
      >
        {({ label, value, divider }) => (
          <Item key={value} divider={divider}>
            {label}
          </Item>
        )}
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
    <Flexbox gap={10} alignItems="center" wrap="nowrap">
      <Icon className="mr-2" onClick={handleClick}>
        <Icons.Calendar />
      </Icon>
      <Text>
        {formatDate(startDate, 'd LLL y', locale)}
        {!isSameDay(startDate, endDate) && ` — ${formatDate(endDate, 'd LLL y', locale)}`}
      </Text>
    </Flexbox>
  );
};

export default DateFilter;
