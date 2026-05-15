import { Button, Column, Icon, List, MenuTrigger, Popover, SearchField } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { ChevronRight } from '@/components/icons';

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
  const displayValue = renderValue
    ? renderValue(value)
    : value.length > 0
      ? value.join(', ')
      : null;

  return (
    <MenuTrigger>
      <Button
        variant="outline"
        className="w-full justify-between"
        style={{ maxWidth: '100%', overflow: 'hidden' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayValue ?? placeholder}
        </span>
        <Icon rotate={90} size="sm" aria-hidden="true">
          <ChevronRight />
        </Icon>
      </Button>
      <Popover style={{ minWidth: 'var(--trigger-width)', maxWidth: 'var(--trigger-width)' }}>
        <Column
          gap="2"
          padding="2"
          border
          borderRadius="md"
          shadow="lg"
          className="bg-surface-overlay"
        >
          {allowSearch && <SearchField value={searchValue} onSearch={onSearch} autoFocus />}
          <List
            selectionMode="multiple"
            value={value}
            onChange={onChange}
            showCheckmark
            renderEmptyState={renderEmptyState}
          >
            {children}
          </List>
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
