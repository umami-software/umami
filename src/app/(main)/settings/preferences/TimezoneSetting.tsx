import { Button, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useMessages, useTimezone } from '@/components/hooks';
import { getTimezone } from '@/lib/date';

const timezones = Intl.supportedValuesOf('timeZone');

export function TimezoneSetting() {
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { timezone, saveTimezone } = useTimezone();
  const items = search
    ? timezones.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : timezones;

  const handleReset = () => saveTimezone(getTimezone());

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Row gap>
      <SearchSelect
        value={timezone}
        items={items.map(item => ({ id: item, name: item }))}
        onChange={(value: any) => saveTimezone(value)}
        onSearch={setSearch}
        onOpenChange={handleOpen}
        maxHeight={480}
        renderValue={<Text truncate>{timezone}</Text>}
        triggerProps={{ className: 'justify-between', style: { minWidth: '250px' } }}
      />
      <Button variant="outline" onClick={handleReset}>
        {t(labels.reset)}
      </Button>
    </Row>
  );
}
