import { Menu, MenuItem, Text, MenuSection, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface FieldSelectFormProps {
  fields?: any[];
  onSelect?: (value: any) => void;
  showType?: boolean;
}

export function FieldSelectForm({ fields = [], onSelect, showType = true }: FieldSelectFormProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <Menu onAction={value => onSelect?.(value)}>
      <MenuSection title={formatMessage(labels.fields)} selectionMode="multiple">
        {fields.map(({ name, label, type }) => {
          return (
            <MenuItem key={name} id={name}>
              <Row alignItems="center" justifyContent="space-between">
                <Text>{label || name}</Text>
                {showType && type && <Text color="muted">{type}</Text>}
              </Row>
            </MenuItem>
          );
        })}
      </MenuSection>
    </Menu>
  );
}
