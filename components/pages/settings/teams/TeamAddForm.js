import { useRef } from 'react';
import { Form, FormRow, FormInput, FormButtons, TextField, Button } from 'react-basics';
import useApi from 'hooks/useApi';

export default function TeamAddForm({ onSave, onClose }) {
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/teams', data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error}>
      <FormRow label="Name">
        <FormInput name="name" rules={{ required: 'Required' }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Save
        </Button>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
