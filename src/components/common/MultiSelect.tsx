import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
  SearchField,
} from '@umami/react-zen';
import {
  Children,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import { ChevronRight } from '@/components/icons';

const listStyle = {
  maxHeight: 'min(320px, calc(100dvh - 8rem))',
};

interface MultiSelectContextValue {
  value: string[];
  onToggle: (value: string, checked: boolean) => void;
}

const MultiSelectContext = createContext<MultiSelectContextValue>({
  value: [],
  onToggle: () => {},
});

interface MultiSelectProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  allowSearch?: boolean;
  renderEmptyState?: () => ReactNode;
  renderValue?: (values: string[]) => ReactNode;
  children: ReactNode;
}

export function MultiSelectItem({ value, children }: { value: string; children: ReactNode }) {
  const { value: selected, onToggle } = useContext(MultiSelectContext);

  return (
    <DropdownMenuCheckboxItem
      checked={selected.includes(value)}
      onCheckedChange={checked => onToggle(value, checked)}
      closeOnClick={false}
    >
      {children}
    </DropdownMenuCheckboxItem>
  );
}

export function MultiSelect({
  value = [],
  onChange,
  searchValue,
  onSearch,
  placeholder = 'Select an item',
  allowSearch,
  renderEmptyState,
  renderValue,
  children,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const displayValue = renderValue
    ? renderValue(value)
    : value.length > 0
      ? value.join(', ')
      : null;

  const handleToggle = (item: string, checked: boolean) => {
    onChange?.(checked ? [...value.filter(v => v !== item), item] : value.filter(v => v !== item));
  };

  // The menu moves focus to its popup when it opens, so focus the search field after that.
  useEffect(() => {
    if (!open || !allowSearch) return;

    const frame = requestAnimationFrame(() => searchRef.current?.focus());

    return () => cancelAnimationFrame(frame);
  }, [open, allowSearch]);

  return (
    <MultiSelectContext.Provider value={{ value, onToggle: handleToggle }}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-between"
              style={{ maxWidth: '100%', overflow: 'hidden' }}
            />
          }
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayValue ?? placeholder}
          </span>
          <Icon rotate={90} size="sm" aria-hidden="true">
            <ChevronRight />
          </Icon>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex flex-col gap-2"
          style={{
            width: 'var(--anchor-width)',
            maxWidth: 'var(--available-width)',
            // The list scrolls in its own scroll area, so the menu itself never does.
            overflow: 'hidden',
          }}
        >
          {allowSearch && (
            <SearchField
              ref={searchRef}
              value={searchValue}
              onSearch={onSearch}
              autoFocus
              onKeyDown={event => {
                if (event.key !== 'Escape' && event.key !== 'Tab') {
                  event.stopPropagation();
                }
              }}
            />
          )}
          <OverlayScrollArea style={listStyle}>
            <div>
              {children}
              {Children.count(children) === 0 && renderEmptyState?.()}
            </div>
          </OverlayScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </MultiSelectContext.Provider>
  );
}
