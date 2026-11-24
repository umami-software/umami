import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  Loading,
} from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, type ReactNode, useMemo } from 'react';
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
      onInputValueChange={search => onSearch?.(search)}
      onOpenChange={open => onOpenChange?.(open)}
    >
      <ComboboxTrigger render={<Button variant="outline" {...triggerProps} />}>
        {renderValue}
      </ComboboxTrigger>
      <ComboboxContent style={contentStyle}>
        <ComboboxInput showTrigger={false} placeholder={placeholder ?? t(labels.search)} />
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
