import {
  Button,
  Calendar,
  DialogFooter,
  Row,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@umami/react-zen';
import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  min,
  startOfDay,
  subMonths,
} from 'date-fns';
import { type ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';

const FILTER_DAY = 'filter-day';
const FILTER_RANGE = 'filter-range';

export function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  title,
  onChange,
  onClose,
}: {
  title?: ReactNode;
  startDate: Date;
  endDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string>(
    isValid(defaultStartDate) &&
      isValid(defaultEndDate) &&
      isSameDay(defaultStartDate, defaultEndDate)
      ? FILTER_DAY
      : FILTER_RANGE,
  );
  const [date, setDate] = useState(isValid(defaultStartDate) ? defaultStartDate : new Date());
  const [startDate, setStartDate] = useState(
    isValid(defaultStartDate) ? defaultStartDate : new Date(),
  );
  const [endDate, setEndDate] = useState(isValid(defaultEndDate) ? defaultEndDate : new Date());
  const { t, labels } = useMessages();
  const rangeEndDate = endDate ?? startDate;

  const isInvalidDate = !date || !isValid(date);
  const isInvalidRange =
    !startDate ||
    !rangeEndDate ||
    !isValid(startDate) ||
    !isValid(rangeEndDate) ||
    isAfter(startDate, rangeEndDate);

  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const disabled =
    selected === FILTER_DAY
      ? isInvalidDate ||
        Boolean(minDate && isBefore(startOfDay(date), startOfDay(minDate))) ||
        Boolean(maxDate && isAfter(startOfDay(date), startOfDay(maxDate)))
      : isInvalidRange ||
        Boolean(minDate && isBefore(startOfDay(startDate), startOfDay(minDate))) ||
        Boolean(maxDate && isAfter(startOfDay(rangeEndDate), startOfDay(maxDate)));

  const handleSave = () => {
    if (disabled) {
      return;
    }

    if (selected === FILTER_DAY) {
      if (!isValid(date)) {
        return;
      }
      onChange(`range:${startOfDay(date).getTime()}:${endOfDay(date).getTime()}`);
    } else {
      if (!isValid(startDate) || !isValid(rangeEndDate)) {
        return;
      }
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(rangeEndDate).getTime()}`);
    }
  };

  return (
    <>
      <Tabs
        value={selected}
        onValueChange={value => setSelected(value as string)}
        style={{ gap: '1.5rem' }}
      >
        <Row alignItems="center" justifyContent="space-between" gap wrap="wrap">
          {title}
          <TabsList>
            <TabsTrigger value={FILTER_DAY}>{t(labels.singleDay)}</TabsTrigger>
            <TabsTrigger value={FILTER_RANGE}>{t(labels.dateRange)}</TabsTrigger>
          </TabsList>
        </Row>
        <TabsContent value={FILTER_DAY}>
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            disabled={disabledDays}
            onSelect={setDate}
            required
            style={{ margin: '0 auto' }}
          />
        </TabsContent>
        <TabsContent value={FILTER_RANGE}>
          <Calendar
            mode="range"
            numberOfMonths={2}
            resetOnSelect
            selected={{ from: startDate, to: endDate }}
            defaultMonth={subMonths(min([rangeEndDate, new Date()]), 1)}
            showOutsideDays={false}
            disabled={disabledDays}
            onSelect={range => {
              setStartDate(range?.from);
              setEndDate(range?.to);
            }}
            required
            style={{ margin: '0 auto' }}
          />
        </TabsContent>
      </Tabs>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <Button onClick={handleSave} disabled={disabled}>
          {t(labels.apply)}
        </Button>
      </DialogFooter>
    </>
  );
}
