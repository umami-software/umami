import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  cn,
  Field,
  FieldLabel,
  Loading,
} from '@umami/react-zen';
import { type CSSProperties, type ReactNode, type Ref, useId } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMessages } from '@/components/hooks';

export interface ComboBoxProps {
  /** The options, as strings. */
  items: string[];
  value?: string | null;
  inputValue?: string;
  onValueChange?: (value: string | null) => void;
  onInputValueChange?: (value: string, details: { reason: string }) => void;
  /** Pass `null` when `items` is already filtered, e.g. by a server-side search. */
  filter?: null | ((item: string, query: string) => boolean);
  label?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  showClear?: boolean;
  isLoading?: boolean;
  /** Shown when no option matches. Defaults to "No results found". */
  emptyState?: ReactNode;
  className?: string;
  'aria-label'?: string;
  maxHeight?: CSSProperties['maxHeight'];
  /** Forwarded to the input, so a react-hook-form `field` can be spread onto the component. */
  name?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
}

export function ComboBox({
  items,
  label,
  placeholder,
  disabled,
  showClear,
  isLoading,
  emptyState,
  className,
  maxHeight = 'min(400px, calc(100dvh - 8rem))',
  'aria-label': ariaLabel,
  name,
  onBlur,
  ref,
  ...props
}: ComboBoxProps) {
  const id = useId();
  const { t, messages } = useMessages();

  const control = (
    <Combobox items={items} disabled={disabled} {...props}>
      <ComboboxInput
        ref={ref}
        id={id}
        name={name}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        showClear={showClear}
        aria-label={ariaLabel}
        className={cn('w-full', className)}
      />
      <ComboboxContent>
        {isLoading ? (
          <Loading placement="center" icon="dots" style={{ padding: '24px 0' }} />
        ) : (
          <ComboboxEmpty>
            {emptyState ?? <Empty message={t(messages.noResultsFound)} />}
          </ComboboxEmpty>
        )}
        {!isLoading && (
          <ComboboxList style={{ maxHeight }}>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  );

  if (!label) {
    return control;
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {control}
    </Field>
  );
}
