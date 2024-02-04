'use client';
import { Website } from '@prisma/client';
import { useRef } from 'react';
import {
  SubmitButton,
  Form,
  FormInput,
  FormRow,
  FormButtons,
  TextField,
  useToasts,
} from 'react-basics';
import { useApi, useMessages } from 'components/hooks';
import { DOMAIN_REGEX } from 'lib/constants';

export function WebsiteEditForm({
  website,
  onSave,
}: {
  website: Website;
  onSave?: (data: any) => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/websites/${website.id}`, data),
  });
  const ref = useRef(null);
  const { showToast } = useToasts();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        showToast({ message: formatMessage(messages.saved), variant: 'success' });
        ref.current.reset(data);
        onSave?.(data);
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={website}>
      <FormRow label={formatMessage(labels.websiteId)}>
        <TextField value={website.id} readOnly allowCopy />
      </FormRow>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label={formatMessage(labels.domain)}>
        <FormInput
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
        <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default WebsiteEditForm;
