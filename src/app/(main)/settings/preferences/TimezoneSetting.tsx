import { useState } from 'react';
import { Row, Select, ListItem, Button } from '@umami/react-zen';
import { useTimezone, useMessages, usePreferences } from '@/components/hooks';
import { getTimezone } from '@/lib/date';

const timezones = Intl.supportedValuesOf('timeZone');

export function TimezoneSetting() {
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const { updatePreferences } = usePreferences();
  const { timezone, saveTimezone } = useTimezone();
  const items = search
    ? timezones.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : timezones;

  const handleChange = (value: string) => {
    saveTimezone(value);
    updatePreferences({ timezone: value });
  };

  const handleReset = () => {
    saveTimezone(getTimezone());
    updatePreferences({ timezone: null });
  };

  const handleOpen = isOpen => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Row gap>
      <Select
        value={timezone}
        onChange={handleChange}
        allowSearch={true}
        onSearch={setSearch}
        onOpenChange={handleOpen}
        listProps={{ style: { maxHeight: 300 } }}
      >
        {items.map((item: any) => (
          <ListItem key={item} id={item}>
            {item}
          </ListItem>
        ))}
        {!items.length && <ListItem></ListItem>}
      </Select>
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
