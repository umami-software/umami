import { Key } from 'react';
import { Grid, Column, List, ListItem } from '@umami/react-zen';
import { useFields, useMessages } from '@/components/hooks';
import { FilterRecord } from '@/components/common/FilterRecord';
import { Empty } from '@/components/common/Empty';

export interface FieldFiltersProps {
  websiteId: string;
  filters: { name: string; operator: string; value: string }[];
  startDate: Date;
  endDate: Date;
  onSave?: (data: any) => void;
}

export function FieldFilters({
  websiteId,
  filters,
  startDate,
  endDate,
  onSave,
}: FieldFiltersProps) {
  const { formatMessage, messages } = useMessages();
  const { fields } = useFields();

  const updateFilter = (name: string, props: Record<string, any>) => {
    onSave(filters.map(filter => (filter.name === name ? { ...filter, ...props } : filter)));
  };

  const handleAdd = (name: Key) => {
    onSave(filters.concat({ name: name.toString(), operator: 'eq', value: '' }));
  };

  const handleChange = (name: string, value: Key) => {
    updateFilter(name, { value });
  };

  const handleSelect = (name: string, operator: Key) => {
    updateFilter(name, { operator });
  };

  const handleRemove = (name: string) => {
    onSave(filters.filter(filter => filter.name !== name));
  };

  return (
    <Grid columns="160px 1fr" overflow="hidden" gapY="6">
      <Column border="right" paddingRight="3">
        <List onAction={handleAdd}>
          {fields.map((field: any) => {
            const isDisabled = !!filters.find(({ name }) => name === field.name);
            return (
              <ListItem key={field.name} id={field.name} isDisabled={isDisabled}>
                {field.label}
              </ListItem>
            );
          })}
        </List>
      </Column>
      <Column paddingLeft="6" overflow="auto" gapY="4" height="500px" style={{ contain: 'layout' }}>
        {filters.map(filter => {
          return (
            <FilterRecord
              key={filter.name}
              websiteId={websiteId}
              type={filter.name}
              startDate={startDate}
              endDate={endDate}
              {...filter}
              onSelect={handleSelect}
              onRemove={handleRemove}
              onChange={handleChange}
            />
          );
        })}
        {!filters.length && <Empty message={formatMessage(messages.nothingSelected)} />}
      </Column>
    </Grid>
  );
}
