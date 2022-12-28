import { SubmitButton, Form, FormInput, FormRow, FormButtons, TextField } from 'react-basics';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import useApi from 'hooks/useApi';

export default function TeamEditForm({ teamId, data, onSave }) {
  const { post } = useApi();
  const { mutate, error } = useMutation(data => post(`/teams/${teamId}`, data));
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
      <FormRow label="Team ID">
        <TextField value={teamId} readOnly allowCopy />
      </FormRow>
      <FormInput name="name" label="Name" rules={{ required: 'Required' }}>
        <TextField />
      </FormInput>
      <FormButtons>
        <SubmitButton variant="primary">Save</SubmitButton>
      </FormButtons>
    </Form>
  );
}
