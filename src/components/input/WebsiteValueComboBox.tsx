import { useDebounce } from '@umami/react-zen';
import { useEffect, useMemo, useState } from 'react';
import { ComboBox, type ComboBoxProps } from '@/components/common/ComboBox';
import { useTimezone, useWebsiteValuesQuery } from '@/components/hooks';

const DEFAULT_PLACEHOLDER = 'Select an item';

export interface WebsiteValueComboBoxProps
  extends Omit<
    ComboBoxProps,
    'inputValue' | 'items' | 'value' | 'onInputValueChange' | 'isLoading'
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
    <ComboBox
      {...props}
      label={label}
      className={className}
      aria-label={props['aria-label'] ?? (typeof label === 'string' ? label : undefined)}
      items={items}
      inputValue={value}
      placeholder={placeholder}
      onInputValueChange={value => {
        setSearch(value);
        onChange(value);
      }}
      isLoading={primaryQuery.isLoading || additionalQuery.isLoading}
    />
  );
}
