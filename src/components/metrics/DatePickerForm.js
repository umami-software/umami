import { useState } from 'react';
import { Button, ButtonGroup, Calendar } from 'react-basics';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import useLocale from 'components/hooks/useLocale';
import { getDateLocale } from 'lib/lang';
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
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();

  const disabled =
    selected === FILTER_DAY
      ? isAfter(minDate, singleDate) && isBefore(maxDate, singleDate)
      : isAfter(startDate, endDate);

  const handleSave = () => {
    if (selected === FILTER_DAY) {
      onChange(`range:${singleDate.getTime()}:${singleDate.getTime()}`);
    } else {
      onChange(`range:${startDate.getTime()}:${endDate.getTime()}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <ButtonGroup selectedKey={selected} onSelect={setSelected}>
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
            onChange={setSingleDate}
          />
        )}
        {selected === FILTER_RANGE && (
          <>
            <Calendar
              date={startDate}
              minDate={minDate}
              maxDate={endDate}
              locale={getDateLocale(locale)}
              onChange={setStartDate}
            />
            <Calendar
              date={endDate}
              minDate={startDate}
              maxDate={maxDate}
              locale={getDateLocale(locale)}
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
