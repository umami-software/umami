'use client';
import { Button, Calendar, Column, ComboBox, Dialog, DialogTrigger, Grid, Icon, Label, ListItem, Loading, Popover, Row, Select, TextField } from '@umami/react-zen';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { Empty } from '@/components/common/Empty';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useMessages, usePropertyValuesQuery } from '@/components/hooks';
import { X } from '@/components/icons';
import { DATA_TYPE, OPERATORS } from '@/lib/constants';
import { getMaxSelectableDate } from '@/lib/date';
import type { Operator, PropertyFilter } from '@/lib/types';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';

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
const BOOLEAN_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];
const DATE_OPERATORS: Operator[] = [OPERATORS.before, OPERATORS.after];
const ARRAY_OPERATORS: Operator[] = [OPERATORS.contains, OPERATORS.doesNotContain];
const MULTI_OPERATORS: Operator[] = [OPERATORS.equals, OPERATORS.notEquals];
const FREE_TEXT_OPERATORS: Operator[] = [
  OPERATORS.contains,
  OPERATORS.doesNotContain,
  OPERATORS.regex,
  OPERATORS.notRegex,
];

export function PropertyFilterRecord({
  source,
  websiteId,
  eventName,
  filter,
  filters,
  onChange,
  onRemove,
}: {
  source: PropertyDataSource;
  websiteId: string;
  eventName?: string;
  filter: PropertyFilter;
  filters: PropertyFilter[];
  onChange: (filter: PropertyFilter) => void;
  onRemove: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const [search, setSearch] = useState('');

  const isNumeric = filter.dataType === DATA_TYPE.number;
  const isBoolean = filter.dataType === DATA_TYPE.boolean;
  const isDate = filter.dataType === DATA_TYPE.date;
  const isArray = filter.dataType === DATA_TYPE.array;
  const operators = isNumeric
    ? NUMERIC_OPERATORS
    : isBoolean
      ? BOOLEAN_OPERATORS
      : isDate
        ? DATE_OPERATORS
        : isArray
          ? ARRAY_OPERATORS
          : STRING_OPERATORS;
  const isFreeText = !isArray && FREE_TEXT_OPERATORS.includes(filter.operator);

  const { data, isLoading } = usePropertyValuesQuery(
    source,
    websiteId,
    filter.propertyName,
    filter.dataType,
    filters.filter(f => f !== filter),
    eventName,
    { enabled: !isNumeric && !isBoolean && !isDate && !isFreeText },
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
      case OPERATORS.before: return t(labels.before);
      case OPERATORS.after: return t(labels.after);
      default: return op;
    }
  };

  const handleOperatorChange = (op: Operator) => {
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
          {isBoolean ? (
            <Select
              value={filter.value || 'true'}
              onChange={value => onChange({ ...filter, value: value as string })}
            >
              <ListItem id="true">{t(labels.true)}</ListItem>
              <ListItem id="false">{t(labels.false)}</ListItem>
            </Select>
          ) : isDate ? (
            <DateValuePicker
              value={filter.value}
              onChange={value => onChange({ ...filter, value })}
            />
          ) : isArray ? (
            <ComboBox
              aria-label={filter.propertyName}
              items={filteredValues}
              inputValue={filter.value}
              style={{ width: '100%' }}
              onInputChange={v => {
                setSearch(v);
                onChange({ ...filter, value: v });
              }}
              formValue="text"
              allowsEmptyCollection
              allowsCustomValue
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
            </ComboBox>
          ) : isNumeric || isFreeText ? (
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

function DateValuePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, labels } = useMessages();
  const [showPicker, setShowPicker] = useState(false);
  const selectedDate = getSelectedDate(value);
  const [draftDate, setDraftDate] = useState<Date>(selectedDate);

  return (
    <DialogTrigger isOpen={showPicker} onOpenChange={setShowPicker}>
      <Button
        onPress={() => {
          setDraftDate(getSelectedDate(value));
          setShowPicker(true);
        }}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        <DateDisplay startDate={selectedDate} endDate={selectedDate} />
      </Button>
      <Popover placement="bottom start" shouldFlip isNonModal>
        <Dialog>
          <Column gap>
            <Calendar
              value={draftDate}
              minValue={new Date(2000, 0, 1)}
              maxValue={getMaxSelectableDate()}
              onChange={setDraftDate}
            />
            <Row justifyContent="end" gap>
              <Button onPress={() => setShowPicker(false)}>{t(labels.cancel)}</Button>
              <Button
                variant="primary"
                onPress={() => {
                  onChange(format(draftDate, 'yyyy-MM-dd'));
                  setShowPicker(false);
                }}
              >
                {t(labels.apply)}
              </Button>
            </Row>
          </Column>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

function getSelectedDate(value?: string) {
  if (!value) {
    return new Date();
  }

  const date = parseISO(value);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}
