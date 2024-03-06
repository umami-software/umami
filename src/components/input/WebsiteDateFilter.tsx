import { useDateRange, useLocale } from 'components/hooks';
import { isAfter } from 'date-fns';
import { getOffsetDateRange } from 'lib/date';
import { Button, Icon, Icons } from 'react-basics';
import DateFilter from './DateFilter';
import styles from './WebsiteDateFilter.module.css';
import { DateRange } from 'lib/types';

export function WebsiteDateFilter({ websiteId }: { websiteId: string }) {
  const { dir } = useLocale();
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { value, startDate, endDate, offset } = dateRange;
  const disableForward =
    value === 'all' || isAfter(getOffsetDateRange(dateRange, 1).startDate, new Date());

  const handleChange = (value: string | DateRange) => {
    setDateRange(value);
  };

  const handleIncrement = (increment: number) => {
    setDateRange(getOffsetDateRange(dateRange, increment));
  };

  return (
    <div className={styles.container}>
      {value !== 'all' && !value.startsWith('range') && (
        <div className={styles.buttons}>
          <Button onClick={() => handleIncrement(-1)}>
            <Icon rotate={dir === 'rtl' ? 270 : 90}>
              <Icons.ChevronDown />
            </Icon>
          </Button>
          <Button onClick={() => handleIncrement(1)} disabled={disableForward}>
            <Icon rotate={dir === 'rtl' ? 90 : 270}>
              <Icons.ChevronDown />
            </Icon>
          </Button>
        </div>
      )}
      <DateFilter
        className={styles.dropdown}
        value={value}
        startDate={startDate}
        endDate={endDate}
        offset={offset}
        onChange={handleChange}
        showAllTime={true}
      />
    </div>
  );
}

export default WebsiteDateFilter;
