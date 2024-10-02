import { useState } from 'react';
import { Icon, Modal, Dropdown, Item, Text, Flexbox } from 'react-basics';
import { endOfYear, isSameDay } from 'date-fns';
import DatePickerForm from 'components/metrics/DatePickerForm';
import { useLocale, useMessages } from 'components/hooks';
import Icons from 'components/icons';
import { formatDate, parseDateValue } from 'lib/date';
import styles from './DateFilter.module.css';
import classNames from 'classnames';

export interface DateFilterProps {
  value: string;
  startDate: Date;
  endDate: Date;
  offset?: number;
  className?: string;
  onChange?: (value: string) => void;
  showAllTime?: boolean;
  alignment?: 'start' | 'center' | 'end';
}

export function DateFilter({
  startDate,
  endDate,
  value,
  offset = 0,
  className,
  onChange,
  showAllTime = false,
  alignment = 'end',
}: DateFilterProps) {
  const { formatMessage, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);
  const { locale } = useLocale();

  const options = [
    { label: formatMessage(labels.today), value: '0day' },
    {
      label: formatMessage(labels.lastHours, { x: 24 }),
      value: '24hour',
    },
    {
      label: formatMessage(labels.thisWeek),
      value: '0week',
      divider: true,
    },
    {
      label: formatMessage(labels.lastDays, { x: 7 }),
      value: '7day',
    },
    {
      label: formatMessage(labels.thisMonth),
      value: '0month',
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
    { label: formatMessage(labels.thisYear), value: '0year', divider: true },
    {
      label: formatMessage(labels.lastMonths, { x: 6 }),
      value: '6month',
    },
    {
      label: formatMessage(labels.lastMonths, { x: 12 }),
      value: '12month',
    },
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

  const handleChange = (value: string) => {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    onChange(value);
  };

  const handlePickerChange = (value: string) => {
    setShowPicker(false);
    onChange(value);
  };

  const handleClose = () => setShowPicker(false);

  const renderValue = (value: string) => {
    const { unit } = parseDateValue(value) || {};

    if (offset && unit === 'year') {
      return formatDate(startDate, 'yyyy', locale);
    }

    if (offset && unit === 'month') {
      return formatDate(startDate, 'MMMM yyyy', locale);
    }

    if (value.startsWith('range') || offset) {
      return (
        <CustomRange
          startDate={startDate}
          endDate={endDate}
          unit={unit}
          onClick={() => handleChange('custom')}
        />
      );
    }

    return options.find(e => e.value === value)?.label;
  };

  return (
    <>
      <Dropdown
        className={classNames(className, styles.dropdown)}
        items={options}
        renderValue={renderValue}
        value={value}
        alignment={alignment}
        placeholder={formatMessage(labels.selectDate)}
        onChange={key => handleChange(key as any)}
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

const CustomRange = ({ startDate, endDate, unit, onClick }) => {
  const { locale } = useLocale();

  const monthFormat = unit === 'month';

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
        {monthFormat ? (
          <>{formatDate(startDate, 'MMMM yyyy', locale)}</>
        ) : (
          <>
            {formatDate(startDate, 'd LLL y', locale)}
            {!isSameDay(startDate, endDate) && ` — ${formatDate(endDate, 'd LLL y', locale)}`}
          </>
        )}
      </Text>
    </Flexbox>
  );
};

export default DateFilter;
