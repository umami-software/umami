import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  Label,
  Loading,
  Column,
  Grid,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery, useWebsiteCohortQuery } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { FieldFilters } from '@/components/input/FieldFilters';
import { LookupField } from '@/components/input/LookupField';
import { ActionSelect } from '@/components/input/ActionSelect';

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
  const { formatMessage, labels, messages } = useMessages();

  const { mutate, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${cohortId ? `/${cohortId}` : ''}`,
    {
      type: 'cohort',
    },
  );

  const handleSubmit = async (formData: any) => {
    mutate(formData, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
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
    <Form error={error} onSubmit={handleSubmit} defaultValues={data || defaultValues}>
      {({ watch }) => {
        const type = watch('parameters.action.type');

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
                    name="parameters.action.type"
                    rules={{ required: formatMessage(labels.required) }}
                  >
                    <ActionSelect />
                  </FormField>
                </Column>
                <Column>
                  <FormField
                    name="parameters.action.value"
                    rules={{ required: formatMessage(labels.required) }}
                  >
                    {({ field }) => {
                      return <LookupField websiteId={websiteId} type={type} {...field} />;
                    }}
                  </FormField>
                </Column>
              </Grid>
            </Column>

            <Column width="260px">
              <Label>{formatMessage(labels.dateRange)}</Label>
              <FormField
                name="parameters.dateRange"
                rules={{ required: formatMessage(labels.required) }}
              >
                <DateFilter placement="bottom start" />
              </FormField>
            </Column>

            <Column>
              <Label>{formatMessage(labels.filters)}</Label>
              <FormField
                name="parameters.filters"
                rules={{ required: formatMessage(labels.required) }}
              >
                <FieldFilters websiteId={websiteId} exclude={['path', 'event']} />
              </FormField>
            </Column>

            <FormButtons>
              <Button isDisabled={isPending} onPress={onClose}>
                {formatMessage(labels.cancel)}
              </Button>
              <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
                {formatMessage(labels.save)}
              </FormSubmitButton>
            </FormButtons>
          </>
        );
      }}
    </Form>
  );
}
