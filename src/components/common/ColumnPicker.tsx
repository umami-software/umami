'use client';
import { Button, Checkbox, Column, Icon, MenuTrigger, Popover, Row, Text } from '@umami/react-zen';
import { Columns3 } from 'lucide-react';
import { useMessages } from '@/components/hooks';

export interface ColumnOption {
  id: string;
  label: string;
}

export interface ColumnPickerProps {
  options: ColumnOption[];
  visible: string[];
  onToggle: (id: string) => void;
  onReset?: () => void;
}

export function ColumnPicker({ options, visible, onToggle, onReset }: ColumnPickerProps) {
  const { t, labels } = useMessages();

  return (
    <MenuTrigger>
      <Button variant="quiet" size="sm">
        <Icon>
          <Columns3 />
        </Icon>
        <Text>{t(labels.columns)}</Text>
      </Button>
      <Popover side="bottom" align="end">
        <Column gap="2" padding="2">
          {options.map(option => (
            <Checkbox
              key={option.id}
              isSelected={visible.includes(option.id)}
              onChange={() => onToggle(option.id)}
            >
              {option.label}
            </Checkbox>
          ))}
          {onReset && (
            <Row justifyContent="flex-end">
              <Button size="sm" variant="quiet" onPress={onReset}>
                {t(labels.reset)}
              </Button>
            </Row>
          )}
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
