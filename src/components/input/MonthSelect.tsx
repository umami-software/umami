import { Row, Text, Icon, Button, MenuTrigger, Popover, Menu, MenuItem } from '@umami/react-zen';
import { startOfMonth, endOfMonth, startOfYear, addMonths, subYears } from 'date-fns';
import { Icons } from '@/components/icons';
import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const month = formatDate(date, 'MMMM', locale);
  const year = date.getFullYear();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <Button variant="quiet">
          <Text>{month}</Text>
          <Icon size="sm">
            <Icons.Chevron />
          </Icon>
        </Button>
        <Popover>
          <Menu>
            {months.map(month => {
              return (
                <MenuItem key={month.toString()} id={month.toString()}>
                  {month.getDay()}
                </MenuItem>
              );
            })}
          </Menu>
        </Popover>
      </MenuTrigger>
      <MenuTrigger>
        <Button variant="quiet">
          <Text>{year}</Text>
          <Icon size="sm">
            <Icons.Chevron />
          </Icon>
        </Button>
        <Popover>
          <Menu>
            {years.map(year => {
              return <MenuItem id={year}>{year}</MenuItem>;
            })}
          </Menu>
        </Popover>
      </MenuTrigger>
    </Row>
  );
}
