import { useState } from 'react';
import { Dropdown, Item, Button, Flexbox } from 'react-basics';
import { listTimeZones } from 'timezone-support';
import { useTimezone, useMessages } from 'components/hooks';
import { getTimezone } from 'lib/date';
import styles from './TimezoneSetting.module.css';

export function TimezoneSetting() {
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const [timezone, saveTimezone] = useTimezone();
  const options = search
    ? listTimeZones().filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : listTimeZones();

  const handleReset = () => saveTimezone(getTimezone());

  return (
    <Flexbox gap={10}>
      <Dropdown
        items={options}
        value={timezone}
        onChange={saveTimezone}
        menuProps={{ className: styles.menu }}
        allowSearch={true}
        onSearch={setSearch}
      >
        {item => <Item key={item}>{item}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default TimezoneSetting;
