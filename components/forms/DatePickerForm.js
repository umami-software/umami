import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { isAfter } from 'date-fns';
import Calendar from 'components/common/Calendar';
import Button from 'components/common/Button';
import { FormButtons } from 'components/layout/FormLayout';
import { getDateRangeValues } from 'lib/date';
import styles from './DatePickerForm.module.css';

export default function DatePickerForm({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  minDate,
  maxDate,
  onChange,
  onClose,
}) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  function handleSave() {
    onChange({ ...getDateRangeValues(startDate, endDate), value: 'custom' });
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendars}>
        <Calendar date={startDate} minDate={minDate} maxDate={endDate} onChange={setStartDate} />
        <Calendar date={endDate} minDate={startDate} maxDate={maxDate} onChange={setEndDate} />
      </div>
      <FormButtons>
        <Button variant="action" onClick={handleSave} disabled={isAfter(startDate, endDate)}>
          <FormattedMessage id="button.save" defaultMessage="Save" />
        </Button>
        <Button onClick={onClose}>
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </FormButtons>
    </div>
  );
}
