import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Label,
  Loading,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useMessages, useUpdateQuery, useWebsiteSegmentQuery } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';

export function SegmentEditForm({
  segmentId,
  websiteId,
  filters = [],
  showFilters = true,
  onSave,
  onClose,
}: {
  segmentId?: string;
  websiteId: string;
  filters?: any[];
  showFilters?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { data } = useWebsiteSegmentQuery(websiteId, segmentId);
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [currentMatch, setCurrentMatch] = useState<string>('all');

  useEffect(() => {
    setCurrentMatch((data?.parameters as any)?.match || 'all');
  }, [data]);

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${segmentId ? `/${segmentId}` : ''}`,
    {
      type: 'segment',
    },
  );

  const handleSubmit = async (formData: any) => {
    await mutateAsync(
      {
        ...formData,
        parameters: {
          ...formData.parameters,
          match: currentMatch !== 'all' ? currentMatch : undefined,
        },
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('segments');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (segmentId && !data) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      defaultValues={data || { parameters: { filters } }}
      error={getErrorMessage(error)}
    >
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField autoFocus={!segmentId} />
      </FormField>
      {showFilters && (
        <>
          <Label>{t(labels.filters)}</Label>
          <FormField name="parameters.filters" rules={{ required: t(labels.required) }}>
            <FieldFilters
              websiteId={websiteId}
              match={currentMatch}
              onMatchChange={setCurrentMatch}
            />
          </FormField>
        </>
      )}
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" data-test="button-submit" isDisabled={isPending}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
