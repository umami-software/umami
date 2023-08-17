import { useRef } from 'react';
import {
  Text,
  Icon,
  CalendarMonthSelect,
  CalendarYearSelect,
  Button,
  PopupTrigger,
  Popup,
} from 'react-basics';
import { startOfMonth, endOfMonth } from 'date-fns';
import Icons from 'components/icons';
import { useLocale } from 'hooks';
import { formatDate } from 'lib/date';
import { getDateLocale } from 'lib/lang';
import styles from './MonthSelect.module.css';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const month = formatDate(date, 'MMMM', locale);
  const year = date.getFullYear();
  const ref = useRef();

  const handleChange = date => {
    onChange(`range:${startOfMonth(date).getTime()}:${endOfMonth(date).getTime()}`);
  };

  return (
    <>
      <div ref={ref} className={styles.container}>
        <PopupTrigger>
          <Button className={styles.input} variant="quiet">
            <Text>{month}</Text>
            <Icon size="sm">
              <Icons.ChevronDown />
            </Icon>
          </Button>
          <Popup className={styles.popup} alignment="start">
            <CalendarMonthSelect
              date={date}
              locale={getDateLocale(locale)}
              onSelect={handleChange}
            />
          </Popup>
        </PopupTrigger>
        <PopupTrigger>
          <Button className={styles.input} variant="quiet">
            <Text>{year}</Text>
            <Icon size="sm">
              <Icons.ChevronDown />
            </Icon>
          </Button>
          <Popup className={styles.popup} alignment="start">
            <CalendarYearSelect
              date={date}
              locale={getDateLocale(locale)}
              onSelect={handleChange}
            />
          </Popup>
        </PopupTrigger>
      </div>
    </>
  );
}

export default MonthSelect;
