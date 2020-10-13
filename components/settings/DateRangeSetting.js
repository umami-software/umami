import React from 'react';
import { FormattedMessage } from 'react-intl';
import DateFilter from 'components/common/DateFilter';
import Button from 'components/common/Button';
import useDateRange from 'hooks/useDateRange';
import { DEFAULT_DATE_RANGE } from 'lib/constants';
import { getDateRange } from 'lib/date';
import styles from './DateRangeSetting.module.css';

export default function DateRangeSetting() {
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;

  function handleReset() {
    setDateRange(getDateRange(DEFAULT_DATE_RANGE));
  }

  return (
    <>
      <DateFilter value={value} startDate={startDate} endDate={endDate} onChange={setDateRange} />
      <Button className={styles.button} size="small" onClick={handleReset}>
        <FormattedMessage id="label.reset" defaultMessage="Reset" />
      </Button>
    </>
  );
}
