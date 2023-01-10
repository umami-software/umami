import { useRef } from 'react';
import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import useApi from 'hooks/useApi';
import { DOMAIN_REGEX } from 'lib/constants';

export default function WebsiteAddForm({ onSave, onClose }) {
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/websites', data));
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
      <FormRow label="Domain">
        <FormInput
          name="domain"
          rules={{
            required: 'Required',
            pattern: { value: DOMAIN_REGEX, message: 'Invalid domain' },
          }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={false}>
          Save
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
