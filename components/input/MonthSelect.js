import { useRef, useState } from 'react';
import { Text, Icon, CalendarMonthSelect, CalendarYearSelect, Button } from 'react-basics';
import { startOfMonth, endOfMonth } from 'date-fns';
import Icons from 'components/icons';
import { useLocale } from 'hooks';
import { formatDate } from 'lib/date';
import { getDateLocale } from 'lib/lang';
import styles from './MonthSelect.module.css';

const MONTH = 'month';
const YEAR = 'year';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const [select, setSelect] = useState(null);
  const month = formatDate(date, 'MMMM', locale);
  const year = date.getFullYear();
  const ref = useRef();

  const handleSelect = value => {
    setSelect(state => (state !== value ? value : null));
  };

  const handleChange = date => {
    onChange(`range:${startOfMonth(date).getTime()}:${endOfMonth(date).getTime()}`);
    setSelect(null);
  };

  return (
    <>
      <div ref={ref} className={styles.container}>
        <Button className={styles.input} variant="quiet" onClick={() => handleSelect(MONTH)}>
          <Text>{month}</Text>
          <Icon size="sm">{select === MONTH ? <Icons.Close /> : <Icons.ChevronDown />}</Icon>
        </Button>
        <Button className={styles.input} variant="quiet" onClick={() => handleSelect(YEAR)}>
          <Text>{year}</Text>
          <Icon size="sm">{select === YEAR ? <Icons.Close /> : <Icons.ChevronDown />}</Icon>
        </Button>
      </div>
      {select === MONTH && (
        <CalendarMonthSelect date={date} locale={getDateLocale(locale)} onSelect={handleChange} />
      )}
      {select === YEAR && (
        <CalendarYearSelect date={date} locale={getDateLocale(locale)} onSelect={handleChange} />
      )}
    </>
  );
}

export default MonthSelect;
