import {
  Button,
  Column,
  ComboBox,
  Form,
  FormButtons,
  FormField,
  FormFieldArray,
  FormSubmitButton,
  Grid,
  Icon,
  ListItem,
  ListSeparator,
  Loading,
  Row,
  Select,
  Text,
  TextField,
  useDebounce,
} from '@umami/react-zen';
import { endOfDay, subMonths } from 'date-fns';
import { Fragment, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useApi, useMessages, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { Plus, X } from '@/components/icons';
import { ActionSelect } from '@/components/input/ActionSelect';
import { LookupField } from '@/components/input/LookupField';

const FUNNEL_STEPS_MAX = 8;

function getEventDataDateRange() {
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

function StepRow({
  index,
  websiteId,
  initialEventName,
  onRemove,
}: {
  index: number;
  websiteId: string;
  initialEventName?: string;
  onRemove: () => void;
}) {
  const { t, labels } = useMessages();
  const [eventName, setEventName] = useState(initialEventName ?? '');

  return (
    <Column gap>
      <Grid columns="260px 1fr auto" gap>
        <Column>
          <FormField name={`steps.${index}.type`} rules={{ required: t(labels.required) }}>
            <ActionSelect />
          </FormField>
        </Column>
        <Column>
          <FormField name={`steps.${index}.value`} rules={{ required: t(labels.required) }}>
            {({ field, context }) => {
              const type = context.watch(`steps.${index}.type`);
              return (
                <LookupField
                  websiteId={websiteId}
                  type={type}
                  {...field}
                  onValueChange={(v: string) => {
                    setEventName(v);
                  }}
                />
              );
            }}
          </FormField>
        </Column>
        <Button onPress={onRemove}>
          <Icon size="sm">
            <X />
          </Icon>
        </Button>
      </Grid>
      <FormFieldArray name={`steps.${index}.filters`}>
        {({ fields: filterFields, append: appendFilter, remove: removeFilter, watch }) => {
          const stepType = watch(`steps.${index}.type`);

          if (stepType !== 'event') return null;

          return (
            <Grid gap>
              {filterFields.map(
                (
                  { id: filterId, property: initialProperty }: { id: string; property?: string },
                  filterIndex: number,
                ) => (
                  <FilterRow
                    key={filterId}
                    stepIndex={index}
                    filterIndex={filterIndex}
                    websiteId={websiteId}
                    eventName={eventName}
                    initialProperty={initialProperty}
                    onRemove={() => removeFilter(filterIndex)}
                  />
                ),
              )}
              <Row>
                <Button
                  variant="quiet"
                  onPress={() => appendFilter({ property: '', operator: 'eq', value: '' })}
                >
                  <Icon size="sm">
                    <Plus />
                  </Icon>
                  <Text>{t(labels.filter)}</Text>
                </Button>
              </Row>
            </Grid>
          );
        }}
      </FormFieldArray>
    </Column>
  );
}

function FilterRow({
  stepIndex,
  filterIndex,
  websiteId,
  eventName,
  initialProperty,
  onRemove,
}: {
  stepIndex: number;
  filterIndex: number;
  websiteId: string;
  eventName: string;
  initialProperty?: string;
  onRemove: () => void;
}) {
  const { t, labels } = useMessages();
  const [propertyName, setPropertyName] = useState(initialProperty ?? '');

  return (
    <Grid columns="1fr 140px 1fr auto" gap>
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
      <Button onPress={onRemove}>
        <Icon size="sm">
          <X />
        </Icon>
      </Button>
    </Grid>
  );
}

export function FunnelEditForm({
  id,
  websiteId,
  onSave,
  onClose,
}: {
  id?: string;
  websiteId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels } = useMessages();
  const { data } = useReportQuery(id);
  const { mutateAsync, error, isPending, touch } = useUpdateQuery(`/reports${id ? `/${id}` : ''}`);

  const handleSubmit = async ({
    name,
    ...parameters
  }: {
    name: string;
    [key: string]: unknown;
  }) => {
    await mutateAsync(
      { ...data, id, name, type: 'funnel', websiteId, parameters },
      {
        onSuccess: async () => {
          touch('reports:funnel');
          touch(`report:${id}`);
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (id && !data) {
    return <Loading placement="absolute" />;
  }

  const defaultValues = {
    name: data?.name || '',
    window: data?.parameters?.window || 60,
    steps: (data?.parameters?.steps || [{ type: 'path', value: '' }]).map(step => ({
      ...step,
      filters: step.filters || [],
    })),
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={defaultValues}>
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField autoFocus />
      </FormField>
      <FormField name="window" label={t(labels.window)} rules={{ required: t(labels.required) }}>
        <TextField />
      </FormField>
      <FormFieldArray
        name="steps"
        label={t(labels.steps)}
        rules={{
          validate: value => value.length > 1 || 'At least two steps are required',
        }}
      >
        {({ fields, append, remove }) => {
          return (
            <Grid gap>
              {fields.map(
                ({ id, value: initialEventName }: { id: string; value: string }, index: number) => (
                  <Fragment key={id}>
                    {index > 0 && <ListSeparator />}
                    <StepRow
                      index={index}
                      websiteId={websiteId}
                      initialEventName={initialEventName}
                      onRemove={() => remove(index)}
                    />
                  </Fragment>
                ),
              )}
              <ListSeparator />
              <Row>
                <Button
                  onPress={() => append({ type: 'path', value: '', filters: [] })}
                  isDisabled={fields.length >= FUNNEL_STEPS_MAX}
                >
                  <Icon>
                    <Plus />
                  </Icon>
                  <Text>{t(labels.add)}</Text>
                </Button>
              </Row>
            </Grid>
          );
        }}
      </FormFieldArray>
      <FormButtons>
        <Button onPress={onClose} isDisabled={isPending}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton>{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
