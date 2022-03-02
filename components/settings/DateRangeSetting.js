import React from 'react';
import { FormattedMessage } from 'react-intl';
import DateFilter, { filterOptions } from 'components/common/DateFilter';
import Button from 'components/common/Button';
import useDateRange from 'hooks/useDateRange';
import { DEFAULT_DATE_RANGE } from 'lib/constants';
import styles from './DateRangeSetting.module.css';

export default function DateRangeSetting() {
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;
  const options = filterOptions.filter(e => e.value !== 'all');

  function handleChange(value) {
    setDateRange(value);
  }

  function handleReset() {
    setDateRange(DEFAULT_DATE_RANGE);
  }

  return (
    <>
      <DateFilter
        options={options}
        value={value}
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
      />
      <Button className={styles.button} size="small" onClick={handleReset}>
        <FormattedMessage id="label.reset" defaultMessage="Reset" />
      </Button>
    </>
  );
}
