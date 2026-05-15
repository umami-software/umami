import {
  Button,
  Column,
  ComboBox,
  FormField,
  Grid,
  Icon,
  ListItem,
  Loading,
  Select,
  useDebounce,
} from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useApi, useMessages, useMobile } from '@/components/hooks';
import { X } from '@/components/icons';

export function getEventDataDateRange() {
  return {
    startAt: +subMonths(endOfDay(new Date()), 6),
    endAt: +endOfDay(new Date()),
  };
}

function PropertySelect({
  websiteId,
  eventName,
  value,
  onChange,
  onPropertyChange,
}: {
  websiteId: string;
  eventName?: string;
  value?: string;
  onChange?: (value: string) => void;
  onPropertyChange?: (value: string) => void;
}) {
  const { get, useQuery } = useApi();
  const { t, messages } = useMessages();
  const [search, setSearch] = useState(value ?? '');
  const searchValue = useDebounce(search, 300);
  const { startAt, endAt } = getEventDataDateRange();

  const { data, isLoading } = useQuery<
    Array<{ eventName: string; propertyName: string; total: number }>
  >({
    queryKey: ['event-data:properties', { websiteId, eventName, searchValue, startAt, endAt }],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/properties`, {
        startAt,
        endAt,
        ...(eventName ? { event: eventName } : {}),
        ...(searchValue ? { propertyName: searchValue } : {}),
      }),
    enabled: !!websiteId,
  });

  const properties = [...new Set(data?.map(d => d.propertyName) ?? [])];

  return (
    <ComboBox
      aria-label="PropertySelect"
      items={properties}
      inputValue={value}
      style={{ width: '100%' }}
      onInputChange={v => {
        setSearch(v);
        onChange?.(v);
        onPropertyChange?.(v);
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
      {properties.map(p => (
        <ListItem key={p} id={p}>
          {p}
        </ListItem>
      ))}
    </ComboBox>
  );
}

function ValueSelect({
  websiteId,
  eventName,
  propertyName,
  value,
  onChange,
}: {
  websiteId: string;
  eventName?: string;
  propertyName?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { get, useQuery } = useApi();
  const { t, messages } = useMessages();
  const { startAt, endAt } = getEventDataDateRange();

  const { data, isLoading } = useQuery<Array<{ value: string; total: number }>>({
    queryKey: ['event-data:values', { websiteId, eventName, propertyName, startAt, endAt }],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/values`, {
        startAt,
        endAt,
        event: eventName,
        propertyName,
      }),
    enabled: !!(websiteId && eventName && propertyName),
  });

  const values = data?.map(d => d.value) ?? [];

  return (
    <ComboBox
      aria-label="ValueSelect"
      items={values}
      inputValue={value}
      style={{ width: '100%' }}
      onInputChange={v => {
        onChange?.(v);
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
      {values.map(v => (
        <ListItem key={v} id={v}>
          {v}
        </ListItem>
      ))}
    </ComboBox>
  );
}

function OperatorSelect({
  value = 'eq',
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { t, labels } = useMessages();
  return (
    <Select value={value} onChange={onChange}>
      <ListItem id="eq">{t(labels.is)}</ListItem>
      <ListItem id="neq">{t(labels.isNot)}</ListItem>
      <ListItem id="c">{t(labels.contains)}</ListItem>
      <ListItem id="dnc">{t(labels.doesNotContain)}</ListItem>
    </Select>
  );
}

export interface EventDataFilterRowProps {
  stepIndex: number;
  filterIndex: number;
  websiteId: string;
  eventName: string;
  initialProperty?: string;
  onRemove: () => void;
}

export function EventDataFilterRow({
  stepIndex,
  filterIndex,
  websiteId,
  eventName,
  initialProperty,
  onRemove,
}: EventDataFilterRowProps) {
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
  const [propertyName, setPropertyName] = useState(initialProperty ?? '');

  if (isMobile) {
    return (
      <Grid columns="1fr auto" gap alignItems="start">
        <Column gap>
          <FormField
            name={`steps.${stepIndex}.filters.${filterIndex}.property`}
            rules={{ required: t(labels.required) }}
          >
            <PropertySelect
              websiteId={websiteId}
              eventName={eventName}
              onPropertyChange={v => setPropertyName(v)}
            />
          </FormField>
          <FormField name={`steps.${stepIndex}.filters.${filterIndex}.operator`}>
            <OperatorSelect />
          </FormField>
          <FormField name={`steps.${stepIndex}.filters.${filterIndex}.value`}>
            <ValueSelect websiteId={websiteId} eventName={eventName} propertyName={propertyName} />
          </FormField>
        </Column>
        <Button onPress={onRemove}>
          <Icon size="sm">
            <X />
          </Icon>
        </Button>
      </Grid>
    );
  }

  return (
    <Grid columns="1fr auto 1fr auto" gap>
      <Column style={{ minWidth: 0 }}>
        <FormField
          name={`steps.${stepIndex}.filters.${filterIndex}.property`}
          rules={{ required: t(labels.required) }}
        >
          <PropertySelect
            websiteId={websiteId}
            eventName={eventName}
            onPropertyChange={v => setPropertyName(v)}
          />
        </FormField>
      </Column>
      <Column style={{ minWidth: 0 }}>
        <FormField name={`steps.${stepIndex}.filters.${filterIndex}.operator`}>
          <OperatorSelect />
        </FormField>
      </Column>
      <Column style={{ minWidth: 0, overflow: 'hidden' }}>
        <FormField name={`steps.${stepIndex}.filters.${filterIndex}.value`}>
          <ValueSelect websiteId={websiteId} eventName={eventName} propertyName={propertyName} />
        </FormField>
      </Column>
      <Button onPress={onRemove}>
        <Icon size="sm">
          <X />
        </Icon>
      </Button>
    </Grid>
  );
}
