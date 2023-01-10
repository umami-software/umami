import { SubmitButton, Form, FormInput, FormRow, FormButtons, TextField } from 'react-basics';
import { useRef } from 'react';
import useApi from 'hooks/useApi';
import { DOMAIN_REGEX } from 'lib/constants';

export default function WebsiteEditForm({ websiteId, data, onSave }) {
  const { post, useMutation } = useApi();
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
      <FormRow label="Name">
        <FormInput name="name" rules={{ required: 'Required' }}>
          <TextField />
        </FormInput>
      </FormRow>
      <FormRow label="Domain">
        <FormInput
          name="domain"
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
      </FormRow>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
