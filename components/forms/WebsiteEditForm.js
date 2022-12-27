import { SubmitButton, Form, FormInput, FormRow, FormButtons, TextField } from 'react-basics';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { useApi } from 'next-basics';
import { getAuthToken } from 'lib/client';
import { DOMAIN_REGEX } from 'lib/constants';

export default function WebsiteEditForm({ websiteId, data, onSave }) {
  const { post } = useApi(getAuthToken());
  const { mutate, error } = useMutation(data => post(`/websites/${websiteId}`, data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        onSave(data);
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={data}>
      <FormRow label="Website ID">
        <TextField value={websiteId} readOnly allowCopy />
      </FormRow>
      <FormInput name="name" label="Name" rules={{ required: 'Required' }}>
        <TextField />
      </FormInput>
      <FormInput
        name="domain"
        label="Domain"
        rules={{
          required: 'Required',
          pattern: {
            value: DOMAIN_REGEX,
            message: 'Invalid domain',
          },
        }}
      >
        <TextField />
      </FormInput>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
