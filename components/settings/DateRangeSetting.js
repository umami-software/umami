import React from 'react';
import { FormattedMessage } from 'react-intl';
import DateFilter, { filterOptions } from 'components/common/DateFilter';
import Button from 'components/common/Button';
import useDateRange from 'hooks/useDateRange';
import { DEFAULT_DATE_RANGE } from 'lib/constants';
import { getDateRange } from 'lib/date';
import styles from './DateRangeSetting.module.css';
import useLocale from 'hooks/useLocale';

export default function DateRangeSetting() {
  const { locale } = useLocale();
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;
  const options = filterOptions.filter(e => e.value !== 'all');

  function handleReset() {
    setDateRange(getDateRange(DEFAULT_DATE_RANGE, locale));
  }

  return (
    <>
      <DateFilter
        options={options}
        value={value}
        startDate={startDate}
        endDate={endDate}
        onChange={setDateRange}
      />
      <Button className={styles.button} size="small" onClick={handleReset}>
        <FormattedMessage id="label.reset" defaultMessage="Reset" />
      </Button>
    </>
  );
}
