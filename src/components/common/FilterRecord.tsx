import { useState } from 'react';
import { Grid, Column, TextField, Label, Select, Icon, Button, ListItem } from '@umami/react-zen';
import { useFilters, useFormat, useWebsiteValuesQuery } from '@/components/hooks';
import { Close } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';

export interface FilterRecordProps {
  websiteId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  name: string;
  operator: string;
  value: string;
  onSelect?: (name: string, value: any) => void;
  onRemove?: (name: string) => void;
  onChange?: (name: string, value: string) => void;
}

export function FilterRecord({
  websiteId,
  type,
  startDate,
  endDate,
  name,
  operator,
  value,
  onSelect,
  onRemove,
  onChange,
}: FilterRecordProps) {
  const { fields, operators } = useFilters();
  const [selected, setSelected] = useState(value);
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
  const { data, isLoading } = useWebsiteValuesQuery({
    websiteId,
    type,
    search,
    startDate,
    endDate,
  });
  const isSearch = isSearchOperator(operator);

  const handleSearch = value => {
    setSearch(value);
  };

  const handleSelectOperator = value => {
    onSelect?.(name, value);
  };

  const handleSelectValue = value => {
    setSelected(value);
    onChange?.(name, value);
  };

  return (
    <Column>
      <Label>{fields.find(f => f.name === name)?.label}</Label>
      <Grid columns="1fr auto" gap>
        <Grid columns="200px 1fr" gap>
          <Select
            items={operators.filter(({ type }) => type === 'string')}
            value={operator}
            onSelectionChange={handleSelectOperator}
          >
            {({ name, label }: any) => {
              return (
                <ListItem key={name} id={name}>
                  {label}
                </ListItem>
              );
            }}
          </Select>
          {isSearch && (
            <TextField value={selected} defaultValue={selected} onChange={handleSelectValue} />
          )}
          {!isSearch && (
            <Select
              items={data}
              value={selected}
              onChange={handleSelectValue}
              searchValue={search}
              onSearch={handleSearch}
              isLoading={isLoading}
              allowSearch
            >
              {data?.map(({ value }) => {
                return (
                  <ListItem key={value} id={value}>
                    {formatValue(value, type)}
                  </ListItem>
                );
              })}
            </Select>
          )}
        </Grid>
        <Column justifyContent="flex-end">
          <Button variant="quiet" onPress={() => onRemove?.(name)}>
            <Icon>
              <Close />
            </Icon>
          </Button>
        </Column>
      </Grid>
    </Column>
  );
}
