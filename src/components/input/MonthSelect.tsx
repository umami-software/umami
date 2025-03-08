import { useRef } from 'react';
import { Row, Text, Icon, Button, MenuTrigger, Popover, Menu, MenuItem } from '@umami/react-zen';
import { startOfMonth, endOfMonth, startOfYear, addMonths, subYears } from 'date-fns';
import { Icons } from '@/components/icons';
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

  const start = startOfYear(date);
  const months: Date[] = [];
  for (let i = 0; i < 12; i++) {
    months.push(addMonths(start, i));
  }
  const years: number[] = [];
  for (let i = 0; i < 10; i++) {
    years.push(subYears(start, 10 - i).getFullYear());
  }

  return (
    <Row>
      <MenuTrigger>
        <Button className={styles.input} variant="quiet">
          <Text>{month}</Text>
          <Icon size="sm">
            <Icons.Chevron />
          </Icon>
        </Button>
        <Popover>
          <Menu items={months}>
            {month => {
              return <MenuItem id={month}>{month.getDay()}</MenuItem>;
            }}
          </Menu>
        </Popover>
      </MenuTrigger>
      <MenuTrigger>
        <Button className={styles.input} variant="quiet">
          <Text>{year}</Text>
          <Icon size="sm">
            <Icons.Chevron />
          </Icon>
        </Button>
        <Popover>
          <Menu items={years}>
            {year => {
              return <MenuItem id={year}>{year}</MenuItem>;
            }}
          </Menu>
        </Popover>
      </MenuTrigger>
    </Row>
  );
}
