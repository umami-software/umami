import { Key } from 'react';
import { subMonths, endOfDay } from 'date-fns';
import { Grid, Column, List, ListItem } from '@umami/react-zen';
import { useFields, useMessages } from '@/components/hooks';
import { FilterRecord } from '@/components/common/FilterRecord';
import { Empty } from '@/components/common/Empty';

export interface FieldFiltersProps {
  websiteId: string;
  value?: { name: string; operator: string; value: string }[];
  exclude?: string[];
  onChange?: (data: any) => void;
}

export function FieldFilters({ websiteId, value, exclude = [], onChange }: FieldFiltersProps) {
  const { formatMessage, messages } = useMessages();
  const { fields } = useFields();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const updateFilter = (name: string, props: Record<string, any>) => {
    onChange(value.map(filter => (filter.name === name ? { ...filter, ...props } : filter)));
  };

  const handleAdd = (name: Key) => {
    onChange(value.concat({ name: name.toString(), operator: 'eq', value: '' }));
  };

  const handleChange = (name: string, value: Key) => {
    updateFilter(name, { value });
  };

  const handleSelect = (name: string, operator: Key) => {
    updateFilter(name, { operator });
  };

  const handleRemove = (name: string) => {
    onChange(value.filter(filter => filter.name !== name));
  };

  return (
    <Grid columns="160px 1fr" overflow="hidden" gapY="6">
      <Column border="right" paddingRight="3">
        <List onAction={handleAdd}>
          {fields
            .filter(({ name }) => !exclude.includes(name))
            .map(field => {
              const isDisabled = !!value.find(({ name }) => name === field.name);
              return (
                <ListItem key={field.name} id={field.name} isDisabled={isDisabled}>
                  {field.label}
                </ListItem>
              );
            })}
        </List>
      </Column>
      <Column paddingLeft="6" overflow="auto" gapY="4" height="500px" style={{ contain: 'layout' }}>
        {value.map(filter => {
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
        {!value.length && <Empty message={formatMessage(messages.nothingSelected)} />}
      </Column>
    </Grid>
  );
}
