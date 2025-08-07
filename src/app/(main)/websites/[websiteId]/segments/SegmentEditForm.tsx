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
import { useApi, useMessages, useModified, useWebsiteSegmentQuery } from '@/components/hooks';
import { filtersArrayToObject } from '@/lib/params';

export function SegmentEditForm({
  segmentId,
  websiteId,
  filters = [],
  showFilters = true,
  onSave,
  onClose,
}: {
  segmentId: string;
  websiteId: string;
  filters?: any[];
  showFilters?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { data } = useWebsiteSegmentQuery(websiteId, segmentId);
  const { formatMessage, labels } = useMessages();
  const [currentFilters, setCurrentFilters] = useState(filters);
  const { touch } = useModified();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) =>
      post(`/websites/${websiteId}/segments${segmentId ? `/${segmentId}` : ''}`, {
        ...data,
        type: 'segment',
      }),
  });

  const handleSubmit = async (data: any) => {
    mutate(
      { ...data, parameters: filtersArrayToObject(currentFilters) },
      {
        onSuccess: async () => {
          touch('segments');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (segmentId && !data) {
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
