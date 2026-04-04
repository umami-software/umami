import { Dialog, ListItem, ListSeparator, Modal, Select, type SelectProps } from '@umami/react-zen';
import { endOfYear } from 'date-fns';
import { Fragment, type Key, useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useMessages, useMobile } from '@/components/hooks';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
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
  const { t, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);
  const { startDate, endDate } = parseDateRange(value) || {};
  const { isMobile } = useMobile();

  const options = [
    { label: t(labels.today), value: '0day' },
    {
      label: t(labels.lastHours, { x: '24' }),
      value: '24hour',
    },
    {
      label: t(labels.thisWeek),
      value: '0week',
      divider: true,
    },
    {
      label: t(labels.lastDays, { x: '7' }),
      value: '7day',
    },
    {
      label: t(labels.thisMonth),
      value: '0month',
      divider: true,
    },
    {
      label: t(labels.lastDays, { x: '30' }),
      value: '30day',
    },
    {
      label: t(labels.lastDays, { x: '90' }),
      value: '90day',
    },
    { label: t(labels.thisYear), value: '0year' },
    {
      label: t(labels.lastMonths, { x: '6' }),
      value: '6month',
      divider: true,
    },
    {
      label: t(labels.lastMonths, { x: '12' }),
      value: '12month',
    },
    showAllTime && {
      label: t(labels.allTime),
      value: 'all',
      divider: true,
    },
    {
      label: t(labels.customRange),
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
        placeholder={t(labels.selectDate)}
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
    </>
  );
}
