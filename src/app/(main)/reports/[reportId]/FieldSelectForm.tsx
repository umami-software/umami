import { Menu, MenuItem, Text, MenuSection } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Key } from 'react';

export interface FieldSelectFormProps {
  fields?: any[];
  onSelect?: (key: any) => void;
  showType?: boolean;
}

export function FieldSelectForm({ fields = [], onSelect, showType = true }: FieldSelectFormProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <Menu onSelectionChange={key => onSelect(fields[key as any])}>
      <MenuSection title={formatMessage(labels.fields)}>
        {fields.map(({ name, label, type }: any, index: Key) => {
          return (
            <MenuItem key={index}>
              <Text>{label || name}</Text>
              {showType && type && <Text color="muted">{type}</Text>}
            </MenuItem>
          );
        })}
      </MenuSection>
    </Menu>
  );
}
