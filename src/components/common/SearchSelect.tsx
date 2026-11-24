import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  Loading,
  SearchField,
} from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, type ReactNode, useMemo, useState } from 'react';
import { useMessages } from '@/components/hooks';

export interface SearchSelectItem {
  id: string;
  name: string;
}

export interface SearchSelectProps {
  value?: string | null;
  items: SearchSelectItem[];
  isLoading?: boolean;
  disabled?: boolean;
  /** Content of the trigger button. */
  renderValue?: ReactNode;
  placeholder?: string;
  emptyMessage?: ReactNode;
  triggerProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  contentStyle?: CSSProperties;
  /** Maximum height of the option list. */
  maxHeight?: CSSProperties['maxHeight'];
  onChange?: (id: string) => void;
  /** Called with the search text on every keystroke, and with '' when the popup closes. */
  onSearch?: (search: string) => void;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A select whose options come from a server-side search. The search input sits inside the
 * popup, and filtering is left to the caller (`onSearch`), so `items` is shown as is.
 */
export function SearchSelect({
  value = null,
  items,
  isLoading,
  disabled,
  renderValue,
  placeholder,
  emptyMessage,
  triggerProps,
  contentStyle,
  maxHeight,
  onChange,
  onSearch,
  onOpenChange,
}: SearchSelectProps) {
  const { t, labels, messages } = useMessages();
  const ids = useMemo(() => items.map(({ id }) => id), [items]);
  const names = useMemo(() => new Map(items.map(({ id, name }) => [id, name])), [items]);
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <Combobox
      items={ids}
      value={value}
      filter={null}
      disabled={disabled}
      itemToStringLabel={(id: string) => names.get(id) ?? ''}
      onValueChange={(id: string | null) => {
        if (id) {
          onChange?.(id);
        }
      }}
      inputValue={search}
      onInputValueChange={handleSearch}
      onOpenChange={open => onOpenChange?.(open)}
    >
      <ComboboxTrigger render={<Button variant="outline" {...triggerProps} />}>
        {renderValue}
      </ComboboxTrigger>
      <ComboboxContent style={contentStyle}>
        <div style={{ padding: 4 }}>
          <ComboboxPrimitive.Input
            render={
              <SearchField
                placeholder={placeholder ?? t(labels.search)}
                onValueChange={value => value === '' && handleSearch('')}
              />
            }
          />
        </div>
        {isLoading ? (
          <Loading icon="dots" placement="center" size="sm" style={{ padding: '32px 0' }} />
        ) : (
          <ComboboxEmpty>{emptyMessage ?? t(messages.noResultsFound)}</ComboboxEmpty>
        )}
        {!isLoading && (
          <ComboboxList style={maxHeight ? { maxHeight } : undefined}>
            {(id: string) => (
              <ComboboxItem key={id} value={id}>
                {names.get(id)}
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
