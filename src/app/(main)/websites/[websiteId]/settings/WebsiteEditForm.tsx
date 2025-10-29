import { FormSubmitButton, Form, FormField, FormButtons, TextField } from '@umami/react-zen';
import { useMessages, useUpdateQuery, useWebsite } from '@/components/hooks';
import { DOMAIN_REGEX } from '@/lib/constants';

export function WebsiteEditForm({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const website = useWebsite();
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, touch, toast } = useUpdateQuery(`/websites/${websiteId}`);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('websites');
        touch(`website:${website.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={website}>
      <FormField name="id" label={formatMessage(labels.websiteId)}>
        <TextField data-test="text-field-websiteId" value={website?.id} isReadOnly allowCopy />
      </FormField>
      <FormField
        label={formatMessage(labels.name)}
        data-test="input-name"
        name="name"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <FormField
        label={formatMessage(labels.domain)}
        data-test="input-domain"
        name="domain"
        rules={{
          required: formatMessage(labels.required),
          pattern: {
            value: DOMAIN_REGEX,
            message: formatMessage(messages.invalidDomain),
          },
        }}
      >
        <TextField />
      </FormField>
      <FormButtons>
        <FormSubmitButton data-test="button-submit" variant="primary">
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
