import useDateRange from 'components/hooks/useDateRange';
import { isAfter } from 'date-fns';
import { incrementDateRange } from 'lib/date';
import { Button, Flexbox, Icon, Icons } from 'react-basics';
import DateFilter from './DateFilter';
import styles from './WebsiteDateFilter.module.css';

export function WebsiteDateFilter({ websiteId }) {
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { value, startDate, endDate, selectedUnit } = dateRange;
  const isFutureDate =
    value !== 'all' &&
    selectedUnit &&
    isAfter(incrementDateRange(dateRange, -1).startDate, new Date());

  const handleChange = value => {
    setDateRange(value);
  };

  const handleIncrement = value => {
    setDateRange(incrementDateRange(dateRange, value));
  };

  return (
    <Flexbox justifyContent="center" gap={10}>
      {value !== 'all' && selectedUnit && (
        <Flexbox justifyContent="center" className={styles.buttons}>
          <Button onClick={() => handleIncrement(1)}>
            <Icon rotate={90}>
              <Icons.ChevronDown />
            </Icon>
          </Button>
          <Button onClick={() => handleIncrement(-1)} disabled={isFutureDate}>
            <Icon rotate={270}>
              <Icons.ChevronDown />
            </Icon>
          </Button>
        </Flexbox>
      )}
      <DateFilter
        className={styles.dropdown}
        value={value}
        startDate={startDate}
        endDate={endDate}
        selectedUnit={selectedUnit}
        onChange={handleChange}
        showAllTime={true}
      />
    </Flexbox>
  );
}

export default WebsiteDateFilter;
