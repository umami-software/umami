import { useContext, useRef } from 'react';
import { SubmitButton, Form, FormInput, FormRow, FormButtons, TextField } from 'react-basics';
import { useApi, useMessages, useModified } from 'components/hooks';
import { DOMAIN_REGEX } from 'lib/constants';
import { WebsiteContext } from 'app/(main)/websites/[websiteId]/WebsiteProvider';

export function WebsiteEditForm({ websiteId, onSave }: { websiteId: string; onSave?: () => void }) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${websiteId}`, data),
  });
  const ref = useRef(null);
  const { touch } = useModified();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        touch(`website:${website.id}`);
        onSave?.();
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={website}>
      <FormRow label={formatMessage(labels.websiteId)}>
        <TextField data-test="text-field-websiteId" value={website?.id} readOnly allowCopy />
      </FormRow>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput
          data-test="input-name"
          name="name"
          rules={{ required: formatMessage(labels.required) }}
        >
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.domain)}>
        <FormInput
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
        </FormInput>
      </FormRow>
      <FormButtons>
        <SubmitButton data-test="button-submit" variant="primary">
          {formatMessage(labels.save)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default WebsiteEditForm;
