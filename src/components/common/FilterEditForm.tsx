import { useState, Key } from 'react';
import { Grid, Row, Column, Label, List, ListItem, Button, Heading } from '@umami/react-zen';
import { useFilters, useMessages } from '@/components/hooks';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { FilterRecord } from '@/components/common/FilterRecord';

export interface FilterEditFormProps {
  websiteId?: string;
  data: any[];
  onChange?: (filters: { name: string; type: string; operator: string; value: string }[]) => void;
  onClose?: () => void;
}

export function FilterEditForm({ data = [], onChange, onClose }: FilterEditFormProps) {
  const { formatMessage, labels } = useMessages();
  const [filters, setFilters] = useState(data);
  const { fields } = useFilters();

  const updateFilter = (name: string, props: { [key: string]: any }) => {
    setFilters(filters =>
      filters.map(filter => (filter.name === name ? { ...filter, ...props } : filter)),
    );
  };

  const handleAdd = (name: Key) => {
    setFilters(filters.concat({ name, operator: 'eq', value: '' }));
  };

  const handleChange = (name: string, value: Key) => {
    updateFilter(name, { value });
  };

  const handleSelect = (name: string, operator: Key) => {
    updateFilter(name, { operator });
  };

  const handleRemove = (name: string) => {
    setFilters(filters.filter(filter => filter.name !== name));
  };

  const handleApply = () => {
    onChange?.(filters.filter(f => f.value));
    onClose?.();
  };

  return (
    <Grid columns="160px 1fr" width="760px" gapY="6">
      <Row gridColumn="span 2">
        <Heading>{formatMessage(labels.filters)}</Heading>
      </Row>
      <Column border="right" paddingRight="3">
        <Label>Fields</Label>
        <List onAction={handleAdd}>
          {fields.map((field: any) => {
            const isDisabled = filters.find(({ name }) => name === field.name);
            return (
              <ListItem key={field.name} id={field.name} isDisabled={isDisabled}>
                {field.label}
              </ListItem>
            );
          })}
        </List>
      </Column>
      <Column paddingLeft="6" overflow="auto" gapY="4">
        {filters.map(filter => {
          return (
            <FilterRecord
              key={filter.name}
              {...filter}
              onSelect={handleSelect}
              onRemove={handleRemove}
              onChange={handleChange}
            />
          );
        })}
        {!filters.length && <EmptyPlaceholder message="No filters selected." />}
      </Column>
      <Row alignItems="center" justifyContent="flex-end" gridColumn="span 2" gap>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <Button variant="primary" onPress={handleApply}>
          {formatMessage(labels.apply)}
        </Button>
      </Row>
    </Grid>
  );
}
