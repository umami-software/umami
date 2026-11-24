import {
  Dialog,
  DialogContent,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, Fragment, useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useMessages } from '@/components/hooks';
import { DatePickerForm } from '@/components/metrics/DatePickerForm';
import { getMaxSelectableDate, parseDateRange } from '@/lib/date';

export interface DateFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  showAllTime?: boolean;
  renderDate?: boolean;
  placement?: string;
  className?: string;
  buttonProps?: { className?: string; style?: CSSProperties };
}

export function DateFilter({
  value,
  onChange,
  showAllTime,
  renderDate,
  placement = 'bottom',
  className,
  buttonProps,
}: DateFilterProps) {
  const { t, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);
  const { startDate, endDate } = parseDateRange(value) || {};

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

  const renderValue = (selected: string) => {
    return (value?.startsWith('range') || renderDate) && startDate && endDate ? (
      <DateDisplay startDate={startDate} endDate={endDate} />
    ) : (
      options.find(option => option.value === selected)?.label
    );
  };

  const selectedValue = value?.endsWith(':all') ? 'all' : value;

  const [side, align] = String(placement).split(' ');

  return (
    <>
      <Select value={selectedValue} onValueChange={handleChange}>
        <SelectTrigger
          {...buttonProps}
          className={[className, buttonProps?.className].filter(Boolean).join(' ') || undefined}
        >
          <SelectValue placeholder={t(labels.selectDate)}>{renderValue}</SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          side={side as ComponentProps<typeof SelectContent>['side']}
          align={align === 'top' ? 'start' : align === 'bottom' ? 'end' : (align as any)}
          style={{ minWidth: 200 }}
        >
          {options.map(({ label, value, divider }: any) => {
            return (
              <Fragment key={label}>
                {divider && <SelectSeparator />}
                <SelectItem value={value}>{label}</SelectItem>
              </Fragment>
            );
          })}
        </SelectContent>
      </Select>
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent style={{ width: 'auto', maxWidth: 'calc(100% - 2rem)' }}>
          {showPicker && (
            <DatePickerForm
              startDate={startDate}
              endDate={endDate}
              minDate={new Date(2000, 0, 1)}
              maxDate={getMaxSelectableDate()}
              onChange={handlePickerChange}
              onClose={() => setShowPicker(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
