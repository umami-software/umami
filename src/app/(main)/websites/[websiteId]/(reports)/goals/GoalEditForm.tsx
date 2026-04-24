import {
  Button,
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Grid,
  Label,
  Loading,
  TextField,
} from '@umami/react-zen';
import { useMessages, useMobile, useReportQuery, useUpdateQuery } from '@/components/hooks';
import { ActionSelect } from '@/components/input/ActionSelect';
import { LookupField } from '@/components/input/LookupField';

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
  const { t, labels } = useMessages();
  const { isMobile } = useMobile();
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
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoFocus />
            </FormField>
            <Column>
              <Label>{t(labels.action)}</Label>
              {isMobile ? (
                <Column gap style={{ minWidth: 0 }}>
                  <FormField name="parameters.type" rules={{ required: t(labels.required) }}>
                    <ActionSelect />
                  </FormField>
                  <FormField name="parameters.value" rules={{ required: t(labels.required) }}>
                    {({ field }) => {
                      return <LookupField websiteId={websiteId} type={type} {...field} />;
                    }}
                  </FormField>
                </Column>
              ) : (
                <Grid columns="260px 1fr" gap>
                  <Column style={{ minWidth: 0 }}>
                    <FormField name="parameters.type" rules={{ required: t(labels.required) }}>
                      <ActionSelect />
                    </FormField>
                  </Column>
                  <Column style={{ minWidth: 0 }}>
                    <FormField name="parameters.value" rules={{ required: t(labels.required) }}>
                      {({ field }) => {
                        return <LookupField websiteId={websiteId} type={type} {...field} />;
                      }}
                    </FormField>
                  </Column>
                </Grid>
              )}
            </Column>

            <FormButtons>
              <Button onPress={onClose} isDisabled={isPending}>
                {t(labels.cancel)}
              </Button>
              <FormSubmitButton>{t(labels.save)}</FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
