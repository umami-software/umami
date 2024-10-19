import { useDateRange, useLocale } from 'components/hooks';
import { isAfter } from 'date-fns';
import { getOffsetDateRange } from 'lib/date';
import { DateRange } from 'lib/types';
import { useState } from 'react';
import { Button, Icon, Icons } from 'react-basics';
import DateFilter from './DateFilter';
import WebsiteChartSettings from './WebsiteChartSettings';
import styles from './WebsiteDateFilter.module.css';

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
}: {
  websiteId: string;
  showAllTime?: boolean;
}) {
  const { dir } = useLocale();
  const { dateRange, saveDateRange } = useDateRange(websiteId);
  const { value, startDate, endDate, offset } = dateRange;
  const [showChartParams, setShowChartParams] = useState(false);
  const disableForward =
    value === 'all' || isAfter(getOffsetDateRange(dateRange, 1).startDate, new Date());

  const handleChange = (value: string | DateRange) => {
    saveDateRange(value);
  };

  const handleIncrement = (increment: number) => {
    saveDateRange(getOffsetDateRange(dateRange, increment));
  };

  return (
    <div className={styles.container}>
      <DateFilter
        className={styles.dropdown}
        value={value}
        startDate={startDate}
        endDate={endDate}
        offset={offset}
        onChange={handleChange}
        showAllTime={showAllTime}
      />
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
      <Button onClick={() => setShowChartParams(true)}>
        <Icon rotate={dir === 'rtl' ? 270 : 90}>
          <Icons.Menu />
        </Icon>
      </Button>
      {showChartParams && (
        <WebsiteChartSettings
          isOpened={showChartParams}
          onClose={() => setShowChartParams(false)}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export default WebsiteDateFilter;
