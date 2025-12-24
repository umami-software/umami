import { Button, Column, Grid, List, ListItem } from '@umami/react-zen';
import { useState } from 'react';
import { useFields, useMessages } from '@/components/hooks';

export function FieldSelectForm({
  selectedFields = [],
  onChange,
  onClose,
}: {
  selectedFields?: string[];
  onChange: (values: string[]) => void;
  onClose?: () => void;
}) {
  const [selected, setSelected] = useState(selectedFields);
  const { formatMessage, labels } = useMessages();
  const { fields } = useFields();

  const handleChange = (value: string[]) => {
    setSelected(value);
  };

  const handleApply = () => {
    onChange?.(selected);
    onClose();
  };

  return (
    <Column gap="6">
      <List value={selected} onChange={handleChange} selectionMode="multiple">
        {fields.map(({ name, label }) => {
          return (
            <ListItem key={name} id={name}>
              {label}
            </ListItem>
          );
        })}
      </List>
      <Grid columns="1fr 1fr" gap>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <Button onPress={handleApply} variant="primary">
          {formatMessage(labels.apply)}
        </Button>
      </Grid>
    </Column>
  );
}
