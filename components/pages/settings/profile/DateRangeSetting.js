import DateFilter from 'components/input/DateFilter';
import { Button, Flexbox } from 'react-basics';
import useDateRange from 'hooks/useDateRange';
import { DEFAULT_DATE_RANGE } from 'lib/constants';
import useMessages from 'hooks/useMessages';

export default function DateRangeSetting() {
  const { formatMessage, labels } = useMessages();
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;

  const handleReset = () => setDateRange(DEFAULT_DATE_RANGE);

  return (
    <Flexbox width={400} gap={10}>
      <DateFilter value={value} startDate={startDate} endDate={endDate} />
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}
