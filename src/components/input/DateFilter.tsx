import { Dialog, ListItem, ListSeparator, Modal, Select, type SelectProps } from '@umami/react-zen';
import { endOfYear } from 'date-fns';
import { Fragment, type Key, useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useMessages, useMobile } from '@/components/hooks';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
import { TimeRangePickerForm } from '@/components/metrics/TimeRangePickerForm';
import { parseDateRange } from '@/lib/date';

export interface DateFilterProps extends SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  showAllTime?: boolean;
  renderDate?: boolean;
  placement?: any;
}

export function DateFilter({
  value,
  onChange,
  showAllTime,
  renderDate,
  placement = 'bottom',
  ...props
}: DateFilterProps) {
  const { formatMessage, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { startDate, endDate } = parseDateRange(value) || {};
  const { isMobile } = useMobile();

  const options = [
    { label: formatMessage(labels.today), value: '0day' },
    {
      label: formatMessage(labels.lastHours, { x: '24' }),
      value: '24hour',
    },
    {
      label: formatMessage(labels.lastHours, { x: '12' }),
      value: '12hour',
    },
    {
      label: formatMessage(labels.lastHours, { x: '6' }),
      value: '6hour',
    },
    {
      label: formatMessage(labels.lastHours, { x: '4' }),
      value: '4hour',
    },
    {
      label: formatMessage(labels.lastHours, { x: '2' }),
      value: '2hour',
    },
    {
      label: formatMessage(labels.lastHours, { x: '1' }),
      value: '1hour',
      divider: true,
    },
    {
      label: formatMessage(labels.thisWeek),
      value: '0week',
      divider: true,
    },
    {
      label: formatMessage(labels.lastDays, { x: '7' }),
      value: '7day',
    },
    {
      label: formatMessage(labels.thisMonth),
      value: '0month',
      divider: true,
    },
    {
      label: formatMessage(labels.lastDays, { x: '30' }),
      value: '30day',
    },
    {
      label: formatMessage(labels.lastDays, { x: '90' }),
      value: '90day',
    },
    { label: formatMessage(labels.thisYear), value: '0year' },
    {
      label: formatMessage(labels.lastMonths, { x: '6' }),
      value: '6month',
      divider: true,
    },
    {
      label: formatMessage(labels.lastMonths, { x: '12' }),
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
    {
      label: formatMessage(labels.timeRange),
      value: 'timeRange',
    },
  ]
    .filter(n => n)
    .map((a, id) => ({ ...a, id }));

  const handleChange = (value: Key) => {
    if (value === 'custom') {
      setShowPicker(true);
      return;
    }
    if (value === 'timeRange') {
      setShowTimePicker(true);
      return;
    }
    onChange(value.toString());
  };

  const handlePickerChange = (value: string) => {
    setShowPicker(false);
    onChange(value.toString());
  };

  const handleTimePickerChange = (value: string) => {
    setShowTimePicker(false);
    onChange(value.toString());
  };

  const renderValue = ({ defaultChildren }) => {
    return value?.startsWith('range') || renderDate ? (
      <DateDisplay startDate={startDate} endDate={endDate} />
    ) : (
      defaultChildren
    );
  };

  const selectedValue = value.endsWith(':all') ? 'all' : value;

  return (
    <>
      <Select
        {...props}
        value={selectedValue}
        placeholder={formatMessage(labels.selectDate)}
        onChange={handleChange}
        renderValue={renderValue}
        popoverProps={{ placement, style: { minWidth: 200 } }}
        isFullscreen={isMobile}
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
      {showTimePicker && (
        <Modal isOpen={true}>
          <Dialog>
            <TimeRangePickerForm
              startDate={startDate}
              endDate={endDate}
              minDate={new Date(2000, 0, 1)}
              maxDate={endOfYear(new Date())}
              onChange={handleTimePickerChange}
              onClose={() => setShowTimePicker(false)}
            />
          </Dialog>
        </Modal>
      )}
    </>
  );
}
