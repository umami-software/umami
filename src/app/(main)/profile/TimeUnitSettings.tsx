import { useDateRange, useMessages } from 'components/hooks';
import useTimeUnit from 'components/hooks/useTimeUnit';
import { Button, Dropdown, Flexbox, Item } from 'react-basics';
import styles from './TimeUnitSettings.module.css';

export function TimeUnitSettings() {
  const { formatMessage, labels } = useMessages();
  const { dateRange } = useDateRange();
  const { timeUnit, timeUnitOptions, updateTimeUnit } = useTimeUnit(dateRange);

  const handleReset = () => updateTimeUnit('day');

  return (
    <Flexbox gap={10}>
      <Dropdown
        className={styles.dropdown}
        items={timeUnitOptions}
        value={timeUnit}
        onChange={(value: any) => updateTimeUnit(value)}
        menuProps={{ className: styles.menu }}
      >
        {item => <Item key={item}>{item}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default TimeUnitSettings;
