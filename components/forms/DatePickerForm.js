import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import Calendar from 'components/common/Calendar';
import Button from 'components/common/Button';
import { FormButtons } from 'components/layout/FormLayout';
import { getDateRangeValues } from 'lib/date';
import styles from './DatePickerForm.module.css';
import ButtonGroup from 'components/common/ButtonGroup';

const FILTER_DAY = 0;
const FILTER_RANGE = 1;

export default function DatePickerForm({
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
  const [date, setDate] = useState(defaultStartDate);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const disabled =
    selected === FILTER_DAY
      ? isAfter(minDate, date) && isBefore(maxDate, date)
      : isAfter(startDate, endDate);

  const buttons = [
    {
      label: <FormattedMessage id="label.single-day" defaultMessage="Single day" />,
      value: FILTER_DAY,
    },
    {
      label: <FormattedMessage id="label.date-range" defaultMessage="Date range" />,
      value: FILTER_RANGE,
    },
  ];

  function handleSave() {
    if (selected === FILTER_DAY) {
      onChange({ ...getDateRangeValues(date, date), value: 'custom' });
    } else {
      onChange({ ...getDateRangeValues(startDate, endDate), value: 'custom' });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.filter}>
        <ButtonGroup size="small" items={buttons} selectedItem={selected} onClick={setSelected} />
      </div>
      <div className={styles.calendars}>
        {selected === FILTER_DAY ? (
          <Calendar date={date} minDate={minDate} maxDate={maxDate} onChange={setDate} />
        ) : (
          <>
            <Calendar
              date={startDate}
              minDate={minDate}
              maxDate={endDate}
              onChange={setStartDate}
            />
            <Calendar date={endDate} minDate={startDate} maxDate={maxDate} onChange={setEndDate} />
          </>
        )}
      </div>
      <FormButtons>
        <Button variant="action" onClick={handleSave} disabled={disabled}>
          <FormattedMessage id="label.save" defaultMessage="Save" />
        </Button>
        <Button onClick={onClose}>
          <FormattedMessage id="label.cancel" defaultMessage="Cancel" />
        </Button>
      </FormButtons>
    </div>
  );
}
