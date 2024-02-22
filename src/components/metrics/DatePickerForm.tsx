import { useState } from 'react';
import { Button, ButtonGroup, Calendar } from 'react-basics';
import { isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';
import useLocale from 'components/hooks/useLocale';
import { FILTER_DAY, FILTER_RANGE } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';
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
  const [singleDate, setSingleDate] = useState(defaultStartDate);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const { dateLocale } = useLocale();
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

  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <ButtonGroup selectedKey={selected} onSelect={key => setSelected(key as any)}>
          <Button key={FILTER_DAY}>{formatMessage(labels.singleDay)}</Button>
          <Button key={FILTER_RANGE}>{formatMessage(labels.dateRange)}</Button>
        </ButtonGroup>
      </div>
      <div className={styles.calendars}>
        {selected === FILTER_DAY && (
          <Calendar
            date={singleDate}
            minDate={minDate}
            maxDate={maxDate}
            locale={dateLocale}
            onChange={setSingleDate}
          />
        )}
        {selected === FILTER_RANGE && (
          <>
            <Calendar
              date={startDate}
              minDate={minDate}
              maxDate={endDate}
              locale={dateLocale}
              onChange={setStartDate}
            />
            <Calendar
              date={endDate}
              minDate={startDate}
              maxDate={maxDate}
              locale={dateLocale}
              onChange={setEndDate}
            />
          </>
        )}
      </div>
      <div className={styles.buttons}>
        <Button variant="primary" onClick={handleSave} disabled={disabled}>
          {formatMessage(labels.save)}
        </Button>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </div>
    </div>
  );
}

export default DatePickerForm;
