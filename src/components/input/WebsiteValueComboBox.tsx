import { type ComboBoxProps, cn, Label, ListItem, Loading, useDebounce } from '@umami/react-zen';
import { useEffect, useMemo, useState } from 'react';
import { ComboBox } from '@/components/common/ComboBox';
import { Empty } from '@/components/common/Empty';
import { useMessages, useTimezone, useWebsiteValuesQuery } from '@/components/hooks';

const DEFAULT_PLACEHOLDER = 'Select an item';

export interface WebsiteValueComboBoxProps
  extends Omit<
    ComboBoxProps,
    'children' | 'inputValue' | 'items' | 'onChange' | 'onInputValueChange'
  > {
  websiteId: string;
  type: string;
  additionalType?: string;
  startDate: Date;
  endDate: Date;
  value: string;
  onChange: (value: string) => void;
}

export function WebsiteValueComboBox({
  websiteId,
  type,
  additionalType = '',
  startDate,
  endDate,
  value,
  onChange,
  label,
  className,
  placeholder = DEFAULT_PLACEHOLDER,
  ...props
}: WebsiteValueComboBoxProps) {
  const { t, messages } = useMessages();
  const { toUtc } = useTimezone();
  const [search, setSearch] = useState(value);
  const searchValue = useDebounce(search, 300);
  // startDate/endDate are profile-timezone wall-clock times, as useDateRange({ timezone }) returns them.
  const utcStartDate = toUtc(startDate);
  const utcEndDate = toUtc(endDate);
  const primaryQuery = useWebsiteValuesQuery({
    websiteId,
    type,
    search: searchValue,
    startDate: utcStartDate,
    endDate: utcEndDate,
  });
  const additionalQuery = useWebsiteValuesQuery({
    websiteId,
    type: additionalType,
    search: searchValue,
    startDate: utcStartDate,
    endDate: utcEndDate,
  });

  useEffect(() => {
    setSearch('');
  }, [type, additionalType]);

  const items = useMemo(() => {
    const values = [
      value,
      ...(primaryQuery.data || []).map(({ value }) => value),
      ...(additionalQuery.data || []).map(({ value }) => value),
    ].filter(Boolean);

    return [...new Set<string>(values)];
  }, [value, primaryQuery.data, additionalQuery.data]);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <Label>{label}</Label>}
      <ComboBox
        {...props}
        aria-label={props['aria-label'] ?? label}
        items={items}
        inputValue={value}
        placeholder={placeholder}
        onInputValueChange={value => {
          setSearch(value);
          onChange(value);
        }}
        renderEmptyState={() =>
          primaryQuery.isLoading || additionalQuery.isLoading ? (
            <Loading placement="center" icon="dots" />
          ) : (
            <Empty message={t(messages.noResultsFound)} />
          )
        }
      >
        {items.map(item => (
          <ListItem key={item} id={item}>
            {item}
          </ListItem>
        ))}
      </ComboBox>
    </div>
  );
}
