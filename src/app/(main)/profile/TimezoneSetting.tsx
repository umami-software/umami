import { useState } from 'react';
import { Row, Select, ListItem, Button } from '@umami/react-zen';
import { useTimezone, useMessages } from '@/components/hooks';
import { getTimezone } from '@/lib/date';
import styles from './TimezoneSetting.module.css';

const timezones = Intl.supportedValuesOf('timeZone');

export function TimezoneSetting() {
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const { timezone, saveTimezone } = useTimezone();
  const items = search
    ? timezones.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : timezones;

  const handleReset = () => saveTimezone(getTimezone());

  return (
    <Row gap="3">
      <Select
        className={styles.dropdown}
        items={items}
        value={timezone}
        onChange={(value: any) => saveTimezone(value)}
        allowSearch={true}
        onSearch={setSearch}
      >
        {(item: any) => (
          <ListItem key={item} id={item}>
            {item}
          </ListItem>
        )}
      </Select>
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
