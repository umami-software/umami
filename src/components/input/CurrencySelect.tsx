import { CURRENCIES } from '@/lib/constants';
import { ListItem, Select } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';

export function CurrencySelect({ value, onChange }) {
  const { formatMessage, labels } = useMessages();
  const [search, setSearch] = useState('');

  return (
    <Select
      items={CURRENCIES}
      label={formatMessage(labels.currency)}
      value={value}
      defaultValue={value}
      onChange={onChange}
      listProps={{ style: { maxHeight: 300 } }}
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
