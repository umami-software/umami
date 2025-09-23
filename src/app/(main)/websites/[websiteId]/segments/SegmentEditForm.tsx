import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  Loading,
  Label,
} from '@umami/react-zen';
import { FieldFilters } from '@/components/input/FieldFilters';
import { useMessages, useUpdateQuery, useWebsiteSegmentQuery } from '@/components/hooks';
import { messages } from '@/components/messages';

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
  const { formatMessage, labels, getErrorMessage } = useMessages();

  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    `/websites/${websiteId}/segments${segmentId ? `/${segmentId}` : ''}`,
    {
      type: 'segment',
    },
  );

  const handleSubmit = async (formData: any) => {
    await mutateAsync(formData, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('segments');
        onSave?.();
        onClose?.();
      },
    });
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
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoFocus={!segmentId} />
      </FormField>
      {showFilters && (
        <>
          <Label>{formatMessage(labels.filters)}</Label>
          <FormField name="parameters.filters" rules={{ required: formatMessage(labels.required) }}>
            <FieldFilters websiteId={websiteId} />
          </FormField>
        </>
      )}
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
