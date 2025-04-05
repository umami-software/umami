import { useState, Key, Fragment } from 'react';
import { Icon, Modal, Select, Text, Row, ListItem, ListSeparator, Dialog } from '@umami/react-zen';
import { endOfYear, isSameDay } from 'date-fns';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
import { useLocale, useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/date';

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
  onChange,
  showAllTime = false,
}: DateFilterProps) {
  const { formatMessage, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);

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
    { label: formatMessage(labels.thisYear), value: '0year' },
    {
      label: formatMessage(labels.lastMonths, { x: 6 }),
      value: '6month',
      divider: true,
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

  return (
    <>
      <Select
        selectedKey={value}
        placeholder={formatMessage(labels.selectDate)}
        onSelectionChange={handleChange}
      >
        {options.map(({ label, value, divider }: any) => {
          return (
            <Fragment key={label}>
              {divider && <ListSeparator />}
              <ListItem id={value}>{label}</ListItem>
            </Fragment>
          );
        })}
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

export const CustomRange = ({ startDate, endDate, unit, onClick }) => {
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
