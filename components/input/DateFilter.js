import { useState } from 'react';
import { Icon, Modal, Dropdown, Item, Text, Flexbox } from 'react-basics';
import { endOfYear, isSameDay } from 'date-fns';
import DatePickerForm from 'components/metrics/DatePickerForm';
import useLocale from 'hooks/useLocale';
import { dateFormat, getDateRangeValues } from 'lib/date';
import Icons from 'components/icons';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import useMessages from 'hooks/useMessages';

export function DateFilter({ websiteId, value, className }) {
  const { formatMessage, labels } = useMessages();
  const { get } = useApi();
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const [showPicker, setShowPicker] = useState(false);

  async function handleDateChange(value) {
    if (value === 'all' && websiteId) {
      const data = await get(`/websites/${websiteId}`);

      if (data) {
        setDateRange({ value, ...getDateRangeValues(new Date(data.createdAt), Date.now()) });
      }
    } else {
      setDateRange(value);
    }
  }

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
    {
      label: formatMessage(labels.allTime),
      value: 'all',
      divider: true,
    },
    {
      label: formatMessage(labels.customRange),
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

  const handleChange = value => {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    handleDateChange(value);
  };

  const handlePickerChange = value => {
    setShowPicker(false);
    handleDateChange(value);
  };

  const handleClose = () => setShowPicker(false);

  return (
    <>
      <Dropdown
        className={className}
        items={options}
        renderValue={renderValue}
        value={value}
        alignment="end"
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
        {dateFormat(startDate, 'd LLL y', locale)}
        {!isSameDay(startDate, endDate) && ` — ${dateFormat(endDate, 'd LLL y', locale)}`}
      </Text>
    </Flexbox>
  );
};

export default DateFilter;
