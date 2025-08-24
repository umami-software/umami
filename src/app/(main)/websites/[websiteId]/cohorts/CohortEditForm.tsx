import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  Label,
  Loading,
} from '@umami/react-zen';
import { subMonths, endOfDay } from 'date-fns';
import { FieldFilters } from '@/components/input/FieldFilters';
import { useState } from 'react';
import { useMessages, useUpdateQuery, useWebsiteCohortQuery } from '@/components/hooks';
import { filtersArrayToObject } from '@/lib/params';

export function CohortEditForm({
  cohortId,
  websiteId,
  filters = [],
  showFilters = true,
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
  const [currentFilters, setCurrentFilters] = useState(filters);
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { mutate, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/cohorts${cohortId ? `/${cohortId}` : ''}`,
    {
      ...data,
      type: 'cohort',
    },
  );

  const handleSubmit = async (data: any) => {
    mutate(
      { ...data, parameters: filtersArrayToObject(currentFilters) },
      {
        onSuccess: async () => {
          toast(formatMessage(messages.save));
          touch('cohorts');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (cohortId && !data) {
    return <Loading position="page" />;
  }

  return (
    <Form error={error} onSubmit={handleSubmit} defaultValues={data}>
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoFocus />
      </FormField>
      {showFilters && (
        <>
          <Label>{formatMessage(labels.filters)}</Label>
          <FieldFilters
            websiteId={websiteId}
            filters={currentFilters}
            startDate={startDate}
            endDate={endDate}
            onSave={setCurrentFilters}
          />
        </>
      )}
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton
          variant="primary"
          data-test="button-submit"
          isDisabled={isPending || currentFilters.length === 0}
        >
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
