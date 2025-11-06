import { useState } from 'react';
import { Grid, Column, TextField, Label, Select, Icon, Button, ListItem } from '@umami/react-zen';
import { useFilters, useFormat, useWebsiteValuesQuery } from '@/components/hooks';
import { X } from '@/components/icons';
import { isSearchOperator } from '@/lib/params';
import { Empty } from '@/components/common/Empty';

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
  const items = data?.filter(({ value }) => value) || [];

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSelectOperator = (value: any) => {
    onSelect?.(name, value);
  };

  const handleSelectValue = (value: string) => {
    setSelected(value);
    onChange?.(name, value);
  };

  const renderValue = () => {
    return formatValue(selected, type);
  };

  return (
    <Column>
      <Label>{fields.find(f => f.name === name)?.label}</Label>
      <Grid columns="1fr auto" gap>
        <Grid columns={{ xs: '1fr', md: '200px 1fr' }} gap>
          <Select
            items={operators.filter(({ type }) => type === 'string')}
            value={operator}
            onChange={handleSelectOperator}
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
              items={items}
              value={selected}
              onChange={handleSelectValue}
              searchValue={search}
              renderValue={renderValue}
              onSearch={handleSearch}
              isLoading={isLoading}
              listProps={{ renderEmptyState: () => <Empty /> }}
              allowSearch
            >
              {items?.map(({ value }) => {
                return (
                  <ListItem key={value} id={value}>
                    {formatValue(value, type)}
                  </ListItem>
                );
              })}
            </Select>
          )}
        </Grid>
        <Column justifyContent="flex-start">
          <Button onPress={() => onRemove?.(name)}>
            <Icon>
              <X />
            </Icon>
          </Button>
        </Column>
      </Grid>
    </Column>
  );
}
