import { SetStateAction, useMemo, useState } from 'react';
import { endOfDay, subMonths } from 'date-fns';
import { ComboBox, ListItem, Loading, useDebounce, ComboBoxProps } from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { useMessages, useWebsiteValuesQuery } from '@/components/hooks';

export interface LookupFieldProps extends ComboBoxProps {
  websiteId: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}

export function LookupField({ websiteId, type, value, onChange, ...props }: LookupFieldProps) {
  const { formatMessage, messages } = useMessages();
  const [search, setSearch] = useState(value);
  const searchValue = useDebounce(search, 300);
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { data, isLoading } = useWebsiteValuesQuery({
    websiteId,
    type,
    search: searchValue,
    startDate,
    endDate,
  });

  const items: string[] = useMemo(() => {
    return data?.map(({ value }) => value) || [];
  }, [data]);

  const handleSearch = (value: SetStateAction<string>) => {
    setSearch(value);
  };

  return (
    <ComboBox
      aria-label="LookupField"
      {...props}
      items={items}
      inputValue={value}
      onInputChange={value => {
        handleSearch(value);
        onChange?.(value);
      }}
      formValue="text"
      allowsEmptyCollection
      allowsCustomValue
      renderEmptyState={() =>
        isLoading ? (
          <Loading placement="center" icon="dots" />
        ) : (
          <Empty message={formatMessage(messages.noResultsFound)} />
        )
      }
    >
      {items.map(item => (
        <ListItem key={item} id={item}>
          {item}
        </ListItem>
      ))}
    </ComboBox>
  );
}
