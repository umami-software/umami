import { Field, FieldLabel, Text } from '@umami/react-zen';
import { useState } from 'react';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useMessages } from '@/components/hooks';
import { CURRENCIES } from '@/lib/constants';

const formatCurrency = ({ id, name }: { id: string; name: string }) => `${id} — ${name}`;

export function CurrencySelect({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { t, labels } = useMessages();
  const [search, setSearch] = useState('');
  const selected = CURRENCIES.find(({ id }) => id === value);

  const items = CURRENCIES.filter(
    ({ id, name }) => !search || `${id}${name}`.toLowerCase().includes(search.toLowerCase()),
  ).map(currency => ({ id: currency.id, name: formatCurrency(currency) }));

  return (
    <Field>
      <FieldLabel>{t(labels.currency)}</FieldLabel>
      <SearchSelect
        value={value}
        items={items}
        onSearch={setSearch}
        onChange={onChange}
        maxHeight={480}
        renderValue={<Text truncate>{selected ? formatCurrency(selected) : value}</Text>}
        triggerProps={{ className: 'w-full justify-between' }}
      />
    </Field>
  );
}
