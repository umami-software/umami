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
import { useMessages, useUpdateQuery, useWebsiteSegmentQuery } from '@/components/hooks';
import { SegmentGroupFields } from './SegmentGroupFields';

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
          match: formData.parameters.match !== 'all' ? formData.parameters.match : undefined,
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
          <FormField name="parameters" rules={{ required: t(labels.required) }}>
            <SegmentGroupFields websiteId={websiteId} />
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
