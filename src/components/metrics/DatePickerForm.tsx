import { useState } from 'react';
import { Button, Row, Calendar } from '@umami/react-zen';
import { isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { FILTER_DAY, FILTER_RANGE } from '@/lib/constants';
import { useMessages } from '@/components/hooks';
import { parseDate } from '@internationalized/date';
import styles from './DatePickerForm.module.css';

export function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}) {
  const [selected, setSelected] = useState(
    isSameDay(defaultStartDate, defaultEndDate) ? FILTER_DAY : FILTER_RANGE,
  );
  const [singleDate, setSingleDate] = useState(defaultStartDate || new Date());
  const [startDate, setStartDate] = useState(defaultStartDate || new Date());
  const [endDate, setEndDate] = useState(defaultEndDate || new Date());
  const { formatMessage, labels } = useMessages();

  const disabled =
    selected === FILTER_DAY
      ? isAfter(minDate, singleDate) && isBefore(maxDate, singleDate)
      : isAfter(startDate, endDate);

  const handleSave = () => {
    if (selected === FILTER_DAY) {
      onChange(`range:${startOfDay(singleDate).getTime()}:${endOfDay(singleDate).getTime()}`);
    } else {
      onChange(`range:${startOfDay(startDate).getTime()}:${endOfDay(endDate).getTime()}`);
    }
  };

  console.log({ minDate, maxDate, singleDate, startDate, endDate, disabled });

  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <Row>
          <Button key={FILTER_DAY} onPress={key => setSelected(key as any)}>
            {formatMessage(labels.singleDay)}
          </Button>
          <Button key={FILTER_RANGE} onPress={key => setSelected(key as any)}>
            {formatMessage(labels.dateRange)}
          </Button>
        </Row>
      </div>
      <div className={styles.calendars}>
        {selected === FILTER_DAY && (
          <Calendar
            value={parseDate(singleDate.toISOString().split('T')[0])}
            onChange={d => setSingleDate(d.toDate('America/Los_Angeles'))}
          />
        )}
        {selected === FILTER_RANGE && (
          <>
            <Calendar
              value={parseDate(startDate.toISOString().split('T')[0])}
              onChange={d => setStartDate(d.toDate('America/Los_Angeles'))}
            />
          </>
        )}
      </div>
      <div className={styles.buttons}>
        <Button variant="primary" onPress={handleSave} isDisabled={disabled}>
          {formatMessage(labels.save)}
        </Button>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
      </div>
    </div>
  );
}
