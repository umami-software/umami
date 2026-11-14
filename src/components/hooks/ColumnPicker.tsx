import {
  Button,
  Checkbox,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
} from '@umami/react-zen';
import { type ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';

type ColumnInfo = {
  id: string;
  label: string;
  width: string;
};

export function ColumnPicker({
  columns,
  selectedColumns,
  onColumnToggle,
}: {
  columns: ColumnInfo[];
  selectedColumns: string[];
  onColumnToggle: (id: string, checked: boolean) => void;
}) {
  const { t } = useMessages();

  return (
    <MenuTrigger>
      <Button size="sm" variant="link" aria-label={t('column-picker')}>
        <Icon size={16} aria-hidden="true" />
        <span className="sr-only">{t('column-picker')}</span>
      </Button>
      <Popover side="bottom" align="start">
        <Menu style={{ maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}>
          {columns.map(column => {
            const isSelected = selectedColumns.includes(column.id);
            return (
              <MenuSection key={column.id} title={column.label} style={{ padding: '4px 8px' }}>
                <MenuItem
                  key={column.id}
                  id={column.id}
                  onAction={() => onColumnToggle(column.id, !isSelected)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(_checked: boolean) => onColumnToggle(column.id, _checked)}
                  />
                  {column.label}
                </MenuItem>
              </MenuSection>
            );
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}