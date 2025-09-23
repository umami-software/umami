import {
  Form,
  FormField,
  TextField,
  Grid,
  FormButtons,
  FormSubmitButton,
  Button,
  Loading,
  Column,
  Label,
} from '@umami/react-zen';
import { useMessages, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { LookupField } from '@/components/input/LookupField';
import { ActionSelect } from '@/components/input/ActionSelect';

export function GoalEditForm({
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
  const { formatMessage, labels } = useMessages();
  const { data } = useReportQuery(id);
  const { mutateAsync, error, isPending, touch } = useUpdateQuery(`/reports${id ? `/${id}` : ''}`);

  const handleSubmit = async (formData: Record<string, any>) => {
    await mutateAsync(
      { ...formData, type: 'goal', websiteId },
      {
        onSuccess: async () => {
          if (id) touch(`report:${id}`);
          touch('reports:goal');
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
    name: '',
    parameters: { type: 'path', value: '' },
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={data || defaultValues}>
      {({ watch }) => {
        const type = watch('parameters.type');

        return (
          <>
            <FormField
              name="name"
              label={formatMessage(labels.name)}
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoFocus />
            </FormField>
            <Column>
              <Label>{formatMessage(labels.action)}</Label>
              <Grid columns="260px 1fr" gap>
                <Column>
                  <FormField
                    name="parameters.type"
                    rules={{ required: formatMessage(labels.required) }}
                  >
                    <ActionSelect />
                  </FormField>
                </Column>
                <Column>
                  <FormField
                    name="parameters.value"
                    rules={{ required: formatMessage(labels.required) }}
                  >
                    {({ field }) => {
                      return <LookupField websiteId={websiteId} type={type} {...field} />;
                    }}
                  </FormField>
                </Column>
              </Grid>
            </Column>

            <FormButtons>
              <Button onPress={onClose} isDisabled={isPending}>
                {formatMessage(labels.cancel)}
              </Button>
              <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
