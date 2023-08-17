import useDateRange from 'hooks/useDateRange';
import DateFilter from './DateFilter';
import styles from './WebsiteDateFilter.module.css';

export default function WebsiteDateFilter({ websiteId }) {
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { value, startDate, endDate } = dateRange;

  const handleChange = async value => {
    setDateRange(value);
  };

  return (
    <DateFilter
      className={styles.dropdown}
      value={value}
      startDate={startDate}
      endDate={endDate}
      onChange={handleChange}
      showAllTime={true}
    />
  );
}
