import { ListItem, ListSeparator, Select } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { isValidTimezone } from '@/lib/date';

const CURRENT_TIMEZONE = 'current';
const timezones = [
  'UTC',
  ...(Intl.supportedValuesOf?.('timeZone') ?? []).filter(value => value !== 'UTC'),
];

export function TimezoneFilter() {
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { router, query, updateParams } = useNavigation();
  const { timezone, localTimeZone, canonicalizeTimezone } = useTimezone();
  const hasOverride =
    typeof query.timezone === 'string' && isValidTimezone(canonicalizeTimezone(query.timezone));
  const selectedTimezone = hasOverride ? timezone : CURRENT_TIMEZONE;
  const normalizedSearch = search.trim().toLowerCase();
  const items = normalizedSearch
    ? timezones.filter(value => value.toLowerCase().includes(normalizedSearch))
    : timezones;

  const handleChange = (value: Key) => {
    router.push(
      updateParams({
        timezone: value === CURRENT_TIMEZONE ? undefined : value.toString(),
        page: 1,
      }),
    );
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Select
      value={selectedTimezone}
      onChange={handleChange}
      allowSearch
      onSearch={setSearch}
      onOpenChange={handleOpen}
      maxHeight={480}
      style={{ minWidth: 220 }}
    >
      <ListItem id={CURRENT_TIMEZONE}>
        {t(labels.current)} ({localTimeZone})
      </ListItem>
      <ListSeparator />
      {items.map(item => (
        <ListItem key={item} id={item}>
          {item}
        </ListItem>
      ))}
      {!items.length && <ListItem />}
    </Select>
  );
}
