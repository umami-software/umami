import { Form, FormRow, FormButtons, FormInput, TextField, SubmitButton } from 'react-basics';
import { useRef } from 'react';
import useApi from 'hooks/useApi';

export default function AccountEditForm({ data, onSave }) {
  const { id } = data;
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(({ name }) => post(`/accounts/${id}`, { name }));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave(data);
        ref.current.reset(data);
      },
    });
  };

  return (
    <>
      <Form key={id} ref={ref} onSubmit={handleSubmit} error={error} values={data}>
        <FormRow label="Name">
          <FormInput name="name">
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label="Email">
          <FormInput name="email">
            <TextField readOnly />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton variant="primary">Save</SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
