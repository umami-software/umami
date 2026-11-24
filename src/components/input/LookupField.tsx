import { useDebounce } from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import { type SetStateAction, useMemo, useState } from 'react';
import { ComboBox, type ComboBoxProps } from '@/components/common/ComboBox';
import { useWebsiteValuesQuery } from '@/components/hooks';

export interface LookupFieldProps
  extends Omit<
    ComboBoxProps,
    'items' | 'value' | 'inputValue' | 'onValueChange' | 'onInputValueChange' | 'isLoading'
  > {
  websiteId: string;
  type: string;
  value: string;
  allowCustomValue?: boolean;
  onChange: (value: string) => void;
  onValueChange?: (value: string) => void;
}

export function LookupField({
  websiteId,
  type,
  value,
  allowCustomValue,
  onChange,
  onValueChange,
  ...props
}: LookupFieldProps) {
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

  const options = useMemo(() => {
    if (allowCustomValue && value && !items.includes(value)) {
      return [value, ...items];
    }

    return items;
  }, [allowCustomValue, items, value]);

  const handleSearch = (value: SetStateAction<string>) => {
    setSearch(value);
  };

  return (
    <ComboBox
      aria-label="LookupField"
      {...props}
      items={options}
      value={value ?? ''}
      inputValue={value ?? ''}
      onValueChange={value => {
        const next = value ?? '';
        handleSearch(next);
        onChange?.(next);
        onValueChange?.(next);
      }}
      onInputValueChange={value => {
        handleSearch(value);
        onChange?.(value);
        onValueChange?.(value);
      }}
      isLoading={isLoading}
    />
  );
}
