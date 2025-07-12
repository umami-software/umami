import { useContext } from 'react';
import {
  FormSubmitButton,
  Form,
  FormField,
  FormButtons,
  TextField,
  useToast,
} from '@umami/react-zen';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { DOMAIN_REGEX } from '@/lib/constants';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';

export function WebsiteEditForm({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { toast } = useToast();
  const { touch } = useModified();

  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}`, data),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch(`website:${website.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error} values={website}>
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
