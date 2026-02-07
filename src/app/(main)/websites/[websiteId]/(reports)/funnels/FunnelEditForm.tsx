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
  Loading,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { useMessages, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { Plus, X } from '@/components/icons';
import { ActionSelect } from '@/components/input/ActionSelect';
import { LookupField } from '@/components/input/LookupField';

const FUNNEL_STEPS_MAX = 8;

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

  const handleSubmit = async ({ name, ...parameters }) => {
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
    steps: data?.parameters?.steps || [{ type: 'path', value: '' }],
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
              {fields.map(({ id }: { id: string }, index: number) => {
                return (
                  <Grid key={id} columns="260px 1fr auto" gap>
                    <Column>
                      <FormField
                        name={`steps.${index}.type`}
                        rules={{ required: t(labels.required) }}
                      >
                        <ActionSelect />
                      </FormField>
                    </Column>
                    <Column>
                      <FormField
                        name={`steps.${index}.value`}
                        rules={{ required: t(labels.required) }}
                      >
                        {({ field, context }) => {
                          const type = context.watch(`steps.${index}.type`);
                          return <LookupField websiteId={websiteId} type={type} {...field} />;
                        }}
                      </FormField>
                    </Column>
                    <Button onPress={() => remove(index)}>
                      <Icon size="sm">
                        <X />
                      </Icon>
                    </Button>
                  </Grid>
                );
              })}
              <Row>
                <Button
                  onPress={() => append({ type: 'path', value: '' })}
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
