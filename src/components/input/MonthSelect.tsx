import {
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useLocale } from '@/components/hooks';
import { formatDate } from '@/lib/date';

export function MonthSelect({ date = new Date(), onChange }) {
  const { locale } = useLocale();
  const month = date.getMonth();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  const months = [...Array(12)].map((_, i) => ({
    value: i,
    label: formatDate(new Date(year, i, 1), 'MMMM', locale),
  }));
  const years = [...Array(10)].map((_, i) => ({
    value: currentYear - i,
    label: String(currentYear - i),
  }));

  const handleMonthChange = (month: number) => {
    const d = new Date(date);
    d.setMonth(month);
    onChange?.(d);
  };
  const handleYearChange = (year: number) => {
    const d = new Date(date);
    d.setFullYear(year);
    onChange?.(d);
  };

  return (
    <Row gap>
      <Select items={months} value={month} onValueChange={value => handleMonthChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {months.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select items={years} value={year} onValueChange={value => handleYearChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {years.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Row>
  );
}
