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
import { useMessages, useUpdateQuery, useWebsiteCohortQuery } from '@/components/hooks';
import { ActionSelect } from '@/components/input/ActionSelect';
import { DateFilter } from '@/components/input/DateFilter';
import { FieldFilters } from '@/components/input/FieldFilters';
import { LookupField } from '@/components/input/LookupField';

export function CohortEditForm({
  cohortId,
  websiteId,
  filters = [],
  onSave,
  onClose,
}: {
  cohortId?: string;
  websiteId: string;
  filters?: any[];
  showFilters?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { data } = useWebsiteCohortQuery(websiteId, cohortId);
  const { t, labels, messages, getErrorMessage } = useMessages();

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${cohortId ? `/${cohortId}` : ''}`,
    {
      type: 'cohort',
    },
  );

  const handleSubmit = async (formData: any) => {
    await mutateAsync(formData, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('cohorts');
        onSave?.();
        onClose?.();
      },
    });
  };

  if (cohortId && !data) {
    return <Loading placement="absolute" />;
  }

  const defaultValues = {
    parameters: { filters, dateRange: '30day', action: { type: 'path', value: '' } },
  };

  return (
    <Form
      error={getErrorMessage(error)}
      onSubmit={handleSubmit}
      defaultValues={data || defaultValues}
    >
      {({ watch }) => {
        const type = watch('parameters.action.type');

        return (
          <>
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoFocus />
            </FormField>

            <Column>
              <Label>{t(labels.action)}</Label>
              <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap>
                <Column>
                  <FormField name="parameters.action.type" rules={{ required: t(labels.required) }}>
                    <ActionSelect />
                  </FormField>
                </Column>
                <Column>
                  <FormField
                    name="parameters.action.value"
                    rules={{ required: t(labels.required) }}
                  >
                    {({ field }) => {
                      return <LookupField websiteId={websiteId} type={type} {...field} />;
                    }}
                  </FormField>
                </Column>
              </Grid>
            </Column>

            <Column width="260px">
              <Label>{t(labels.dateRange)}</Label>
              <FormField name="parameters.dateRange" rules={{ required: t(labels.required) }}>
                <DateFilter placement="bottom start" />
              </FormField>
            </Column>

            <Column>
              <Label>{t(labels.filters)}</Label>
              <FormField name="parameters.filters">
                <FieldFilters websiteId={websiteId} exclude={['path', 'event']} />
              </FormField>
            </Column>

            <FormButtons>
              <Button isDisabled={isPending} onPress={onClose}>
                {t(labels.cancel)}
              </Button>
              <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
                {t(labels.save)}
              </FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
