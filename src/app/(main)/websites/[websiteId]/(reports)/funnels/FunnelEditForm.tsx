import {
  Button,
  Column,
  Form,
  FormButtons,
  FormField,
  FormFieldArray,
  FormSubmitButton,
  Grid,
  Icon,
  ListSeparator,
  Loading,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { Fragment, useState } from 'react';
import { useApi, useMessages, useMobile, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { Plus, X } from '@/components/icons';
import { ActionSelect } from '@/components/input/ActionSelect';
import { LookupField } from '@/components/input/LookupField';
import { EventDataFilterRow, getEventDataDateRange } from './EventDataFilterRow';

const FUNNEL_STEPS_MAX = 8;

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
  const { isMobile } = useMobile();
  const { get, useQuery } = useApi();
  const [eventName, setEventName] = useState(initialEventName ?? '');
  const { startAt, endAt } = getEventDataDateRange();

  const { data: eventProperties } = useQuery<Array<{ propertyName: string }>>({
    queryKey: ['event-data:properties', { websiteId, eventName, searchValue: '', startAt, endAt }],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/properties`, {
        startAt,
        endAt,
        ...(eventName ? { event: eventName } : {}),
      }),
    enabled: !!websiteId && !!eventName,
  });

  const hasEventData = (eventProperties?.length ?? 0) > 0;

  const valueField = (
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
  );

  return (
    <Column gap>
      {isMobile ? (
        <Grid columns="1fr auto" gap alignItems="start">
          <Column gap>
            <FormField name={`steps.${index}.type`} rules={{ required: t(labels.required) }}>
              <ActionSelect />
            </FormField>
            {valueField}
          </Column>
          <Button onPress={onRemove}>
            <Icon size="sm">
              <X />
            </Icon>
          </Button>
        </Grid>
      ) : (
        <Grid columns="260px 1fr auto" gap>
          <Column>
            <FormField name={`steps.${index}.type`} rules={{ required: t(labels.required) }}>
              <ActionSelect />
            </FormField>
          </Column>
          <Column>
            {valueField}
          </Column>
          <Button onPress={onRemove}>
            <Icon size="sm">
              <X />
            </Icon>
          </Button>
        </Grid>
      )}
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
                  <EventDataFilterRow
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
              {hasEventData && (
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
              )}
            </Grid>
          );
        }}
      </FormFieldArray>
    </Column>
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
  const { data, isLoading } = useReportQuery(id);
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

  if (id && isLoading) {
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
      <FormButtons style={{ paddingBottom: '16px' }}>
        <Button onPress={onClose} isDisabled={isPending}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton>{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
