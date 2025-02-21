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
import Icons from '@/components/icons';
import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';
import styles from './MonthSelect.module.css';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale, dateLocale } = useLocale();
  const month = formatDate(date, 'MMMM', locale);
  const year = date.getFullYear();
  const ref = useRef();

  const handleChange = (close: () => void, date: Date) => {
    onChange(`range:${startOfMonth(date).getTime()}:${endOfMonth(date).getTime()}`);
    close();
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
            {close => (
              <CalendarMonthSelect
                date={date}
                locale={dateLocale}
                onSelect={handleChange.bind(null, close)}
              />
            )}
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
            {(close: any) => (
              <CalendarYearSelect date={date} onSelect={handleChange.bind(null, close)} />
            )}
          </Popup>
        </PopupTrigger>
      </div>
    </>
  );
}

export default MonthSelect;
