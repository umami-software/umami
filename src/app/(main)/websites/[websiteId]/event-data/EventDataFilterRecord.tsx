'use client';
import { Button, Column, Grid, Icon, Label, ListItem, Loading, Select, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useEventDataValuesQuery, useMessages } from '@/components/hooks';
import { X } from '@/components/icons';
import { OPERATORS } from '@/lib/constants';
import type { EventPropertyFilter, Operator } from '@/lib/types';

const STRING_OPERATORS: Operator[] = [
  OPERATORS.equals,
  OPERATORS.notEquals,
  OPERATORS.contains,
  OPERATORS.doesNotContain,
  OPERATORS.regex,
  OPERATORS.notRegex,
];
const NUMERIC_OPERATORS: Operator[] = [
  OPERATORS.equals,
  OPERATORS.notEquals,
  OPERATORS.greaterThan,
  OPERATORS.lessThan,
  OPERATORS.greaterThanEquals,
  OPERATORS.lessThanEquals,
];
const MULTI_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];
const FREE_TEXT_OPERATORS: Operator[] = [
  OPERATORS.contains,
  OPERATORS.doesNotContain,
  OPERATORS.regex,
  OPERATORS.notRegex,
];

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
  const isFreeText = FREE_TEXT_OPERATORS.includes(filter.operator);

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

  const operatorLabel = (op: Operator) => {
    switch (op) {
      case OPERATORS.equals: return t(labels.is);
      case OPERATORS.notEquals: return t(labels.isNot);
      case OPERATORS.contains: return t(labels.contains);
      case OPERATORS.doesNotContain: return t(labels.doesNotContain);
      case OPERATORS.regex: return t(labels.regexMatch);
      case OPERATORS.notRegex: return t(labels.regexNotMatch);
      case OPERATORS.greaterThan: return t(labels.greaterThan);
      case OPERATORS.lessThan: return t(labels.lessThan);
      case OPERATORS.greaterThanEquals: return t(labels.greaterThanEquals);
      case OPERATORS.lessThanEquals: return t(labels.lessThanEquals);
      default: return op;
    }
  };

  const handleOperatorChange = (op: Operator) => {
    // clear value when switching between multi-select and free-text modes
    const wasMulti = MULTI_OPERATORS.includes(filter.operator);
    const isMulti = MULTI_OPERATORS.includes(op);
    onChange({
      ...filter,
      operator: op,
      value: wasMulti === isMulti ? filter.value : '',
    });
  };

  return (
    <Column>
      <Label>{filter.propertyName}</Label>
      <Grid columns="1fr auto" gap>
        <Grid columns={{ base: '1fr', md: '200px 1fr' }} gap>
          <Select value={filter.operator} onChange={value => handleOperatorChange(value as Operator)}>
            {operators.map(op => (
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
