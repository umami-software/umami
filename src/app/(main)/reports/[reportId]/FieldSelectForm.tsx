import { List, ListItem, Label, Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import styles from './FieldSelectForm.module.css';
import { Key } from 'react';

export interface FieldSelectFormProps {
  fields?: any[];
  onSelect?: (key: any) => void;
  showType?: boolean;
}

export function FieldSelectForm({ fields = [], onSelect, showType = true }: FieldSelectFormProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column>
      <Label>{formatMessage(labels.fields)}</Label>
      <List onSelectionChange={key => onSelect(fields[key as any])}>
        {fields.map(({ name, label, type }: any, index: Key) => {
          return (
            <ListItem key={index} className={styles.item}>
              <div>{label || name}</div>
              {showType && type && <div className={styles.type}>{type}</div>}
            </ListItem>
          );
        })}
      </List>
    </Column>
  );
}
