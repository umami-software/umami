import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  Label,
} from '@umami/react-zen';
import { subMonths, endOfDay } from 'date-fns';
import { FieldFilters } from '@/components/input/FieldFilters';
import { useState } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { filtersArrayToObject } from '@/lib/params';

export function SegmentEditForm({
  websiteId,
  filters = [],
  onSave,
  onClose,
}: {
  websiteId: string;
  filters?: any[];
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const [currentFilters, setCurrentFilters] = useState(filters);
  const { touch } = useModified();
  const startDate = subMonths(endOfDay(new Date()), 6);
  const endDate = endOfDay(new Date());

  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) =>
      post(`/websites/${websiteId}/segments`, { ...data, type: 'segment' }),
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

  return (
    <Form error={error} onSubmit={handleSubmit}>
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <Label>{formatMessage(labels.filters)}</Label>
      <FieldFilters
        websiteId={websiteId}
        filters={currentFilters}
        startDate={startDate}
        endDate={endDate}
        onSave={setCurrentFilters}
      />
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
