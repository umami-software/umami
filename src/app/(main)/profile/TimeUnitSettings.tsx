import { useMessages } from 'components/hooks';
import useTimeUnit from 'components/hooks/useTimeUnit';
import { Button, Dropdown, Flexbox, Item } from 'react-basics';
import styles from './TimeUnitSettings.module.css';

export function TimeUnitSettings() {
  const { formatMessage, labels } = useMessages();
  const { currentTimeUnit, timeUnitOptions, saveTimeUnit } = useTimeUnit();

  const handleReset = () => saveTimeUnit('hour');

  return (
    <Flexbox gap={10}>
      <Dropdown
        className={styles.dropdown}
        items={timeUnitOptions}
        value={currentTimeUnit}
        onChange={(value: any) => saveTimeUnit(value)}
        menuProps={{ className: styles.menu }}
      >
        {item => <Item key={item}>{item}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default TimeUnitSettings;
