'use client';
import { Button, Column, Grid, Icon, Label, ListItem, Loading, Select, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useEventDataValuesQuery, useMessages } from '@/components/hooks';
import { X } from '@/components/icons';
import type { EventPropertyFilter } from '@/lib/types';

const STRING_OPERATORS = ['eq', 'neq', 'c', 'dnc', 'regex', 'notRegex'] as const;
const NUMERIC_OPERATORS = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte'] as const;

export function EventDataFilterRecord({
  websiteId,
  eventName,
  filter,
  onChange,
  onRemove,
}: {
  websiteId: string;
  eventName: string;
  filter: EventPropertyFilter;
  onChange: (filter: EventPropertyFilter) => void;
  onRemove: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const [search, setSearch] = useState('');

  const isNumeric = filter.dataType === 2;
  const operators = isNumeric ? NUMERIC_OPERATORS : STRING_OPERATORS;
  const isFreeText = filter.operator === 'c' || filter.operator === 'dnc' || filter.operator === 'regex' || filter.operator === 'notRegex';

  const { data, isLoading } = useEventDataValuesQuery(
    websiteId,
    eventName,
    filter.propertyName,
    { enabled: !isNumeric && !isFreeText },
  );

  const values = (data as Array<{ value: string }> | undefined)?.map(d => d.value) ?? [];
  const filteredValues = search
    ? values.filter(v => v.toLowerCase().includes(search.toLowerCase()))
    : values;
  const selected = filter.value ? filter.value.split(',').filter(Boolean) : [];

  const operatorLabel = (op: string) => {
    switch (op) {
      case 'eq': return t(labels.is);
      case 'neq': return t(labels.isNot);
      case 'c': return t(labels.contains);
      case 'dnc': return t(labels.doesNotContain);
      case 'regex': return t(labels.regexMatch);
      case 'notRegex': return t(labels.regexNotMatch);
      case 'gt': return t(labels.greaterThan);
      case 'lt': return t(labels.lessThan);
      case 'gte': return t(labels.greaterThanEquals);
      case 'lte': return t(labels.lessThanEquals);
      default: return op;
    }
  };

  const handleOperatorChange = (op: string) => {
    // clear value when switching between multi-select and free-text modes
    const wasMulti = filter.operator === 'eq' || filter.operator === 'neq';
    const isMulti = op === 'eq' || op === 'neq';
    onChange({ ...filter, operator: op, value: wasMulti === isMulti ? filter.value : '' });
  };

  return (
    <Column>
      <Label>{filter.propertyName}</Label>
      <Grid columns="1fr auto" gap>
        <Grid columns={{ base: '1fr', md: '200px 1fr' }} gap>
          <Select value={filter.operator} onChange={handleOperatorChange}>
            {operators.map((op: string) => (
              <ListItem key={op} id={op}>
                {operatorLabel(op)}
              </ListItem>
            ))}
          </Select>
          {isNumeric || isFreeText ? (
            <TextField
              value={filter.value}
              onChange={v => onChange({ ...filter, value: v })}
              inputMode={isNumeric ? 'numeric' : 'text'}
            />
          ) : (
            <MultiSelect
              value={selected}
              onChange={vals => onChange({ ...filter, value: vals.join(',') })}
              searchValue={search}
              onSearch={setSearch}
              allowSearch
              renderValue={vals => (vals.length > 0 ? vals.join(', ') : undefined)}
              renderEmptyState={() =>
                isLoading ? (
                  <Loading placement="center" icon="dots" />
                ) : (
                  <Empty message={t(messages.noResultsFound)} />
                )
              }
            >
              {filteredValues.map(v => (
                <ListItem key={v} id={v}>
                  {v}
                </ListItem>
              ))}
            </MultiSelect>
          )}
        </Grid>
        <Column justifyContent="flex-start">
          <Button onPress={onRemove}>
            <Icon>
              <X />
            </Icon>
          </Button>
        </Column>
      </Grid>
    </Column>
  );
}
