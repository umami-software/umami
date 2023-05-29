import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import DateFilter from './DateFilter';

export default function WebsiteDateFilter({ websiteId, value }) {
  const { get } = useApi();
  const [dateRange, setDateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;

  const handleChange = async value => {
    if (value === 'all' && websiteId) {
      const data = await get(`/websites/${websiteId}`);

      if (data) {
        setDateRange(`range:${new Date(data.createdAt)}:${Date.now()}`);
      }
    } else if (value !== 'all') {
      setDateRange(value);
    }
  };

  return (
    <DateFilter value={value} startDate={startDate} endDate={endDate} onChange={handleChange} />
  );
}
