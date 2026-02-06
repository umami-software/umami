import { Button, Column, Grid, List, ListItem, ListSection } from '@umami/react-zen';
import { useState } from 'react';
import { type FieldGroup, useFields, useMessages } from '@/components/hooks';

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
  const { fields, groupLabels } = useFields();

  const handleChange = (value: string[]) => {
    setSelected(value);
  };

  const handleApply = () => {
    onChange?.(selected);
    onClose();
  };

  const groupedFields = fields
    .filter(field => field.name !== 'event')
    .reduce(
      (acc, field) => {
        const group = field.group;
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(field);
        return acc;
      },
      {} as Record<FieldGroup, typeof fields>,
    );

  return (
    <Column gap="6">
      <Column gap="3" overflowY="auto" maxHeight="400px">
        <List value={selected} onChange={handleChange} selectionMode="multiple">
          {groupLabels.map(({ key: groupKey, label }) => {
            const groupFields = groupedFields[groupKey];
            return (
              <ListSection key={groupKey} title={label}>
                {groupFields.map(field => (
                  <ListItem key={field.name} id={field.name}>
                    {field.filterLabel}
                  </ListItem>
                ))}
              </ListSection>
            );
          })}
        </List>
      </Column>
      <Grid columns="1fr 1fr" gap>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <Button onPress={handleApply} variant="primary">
          {formatMessage(labels.apply)}
        </Button>
      </Grid>
    </Column>
  );
}
