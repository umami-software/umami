import { useState, Key } from 'react';
import { Icon, Modal, Select, Text, Row, ListItem, ListSeparator, Dialog } from '@umami/react-zen';
import { endOfYear, isSameDay } from 'date-fns';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
import { useLocale, useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/date';
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

  const options = [
    { label: formatMessage(labels.today), value: '0day' },
    {
      label: formatMessage(labels.lastHours, { x: 24 }),
      value: '24hour',
    },
    { divider: true },
    {
      label: formatMessage(labels.thisWeek),
      value: '0week',
    },
    {
      label: formatMessage(labels.lastDays, { x: 7 }),
      value: '7day',
    },
    { divider: true },
    {
      label: formatMessage(labels.thisMonth),
      value: '0month',
    },
    {
      label: formatMessage(labels.lastDays, { x: 30 }),
      value: '30day',
    },
    {
      label: formatMessage(labels.lastDays, { x: 90 }),
      value: '90day',
    },
    { divider: true },
    { label: formatMessage(labels.thisYear), value: '0year' },
    {
      label: formatMessage(labels.lastMonths, { x: 6 }),
      value: '6month',
    },
    {
      label: formatMessage(labels.lastMonths, { x: 12 }),
      value: '12month',
    },
    { divider: true },
    showAllTime && {
      label: formatMessage(labels.allTime),
      value: 'all',
    },
    { divider: true },
    {
      label: formatMessage(labels.customRange),
      value: 'custom',
    },
  ]
    .filter(n => n)
    .map((a, id) => ({ ...a, id }));

  const handleChange = (value: Key) => {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    onChange(value.toString());
  };

  const handlePickerChange = (value: string) => {
    setShowPicker(false);
    onChange(value.toString());
  };

  /*
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
  };*/

  return (
    <>
      <Select
        className={classNames(className, styles.dropdown)}
        items={options}
        value={value}
        placeholder={formatMessage(labels.selectDate)}
        onSelectionChange={handleChange}
      >
        {({ label, value, divider }: any) => {
          if (divider) {
            return <ListSeparator />;
          }

          return <ListItem id={value}>{label}</ListItem>;
        }}
      </Select>
      {showPicker && (
        <Modal isOpen={true}>
          <Dialog>
            <DatePickerForm
              startDate={startDate}
              endDate={endDate}
              minDate={new Date(2000, 0, 1)}
              maxDate={endOfYear(new Date())}
              onChange={handlePickerChange}
              onClose={() => setShowPicker(false)}
            />
          </Dialog>
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
    <Row gap="3" alignItems="center" wrap="nowrap">
      <Icon onClick={handleClick}>
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
    </Row>
  );
};
