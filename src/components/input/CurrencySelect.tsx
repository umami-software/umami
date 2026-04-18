import { ListItem, Select } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { CURRENCIES } from '@/lib/constants';

export function CurrencySelect({ value, onChange }) {
  const { t, labels } = useMessages();
  const [search, setSearch] = useState('');

  return (
    <Select
      label={t(labels.currency)}
      value={value}
      defaultValue={value}
      onChange={onChange}
      maxHeight={480}
      onSearch={setSearch}
      allowSearch
    >
      {CURRENCIES.map(({ id, name }) => {
        if (search && !`${id}${name}`.toLowerCase().includes(search)) {
          return null;
        }

        return (
          <ListItem key={id} id={id}>
            {id} &mdash; {name}
          </ListItem>
        );
      }).filter(n => n)}
    </Select>
  );
}
