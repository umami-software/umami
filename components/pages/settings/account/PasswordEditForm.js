import { useRef } from 'react';
import { Form, FormRow, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';

export default function PasswordEditForm({ onSave, onClose }) {
  const { post, useMutation } = useApi();
  const { user } = useUser();
  const { mutate, error, isLoading } = useMutation(data =>
    post(`/accounts/${user.id}/change-password`, data),
  );
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  const samePassword = value => {
    if (value !== ref?.current?.getValues('newPassword')) {
      return "Passwords don't match";
    }
    return true;
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error}>
      <FormRow label="Current password">
        <FormInput name="currentPassword" rules={{ required: 'Required' }}>
          <PasswordField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label="New password">
        <FormInput
          name="newPassword"
          rules={{
            required: 'Required',
            minLength: { value: 8, message: 'Minimum length 8 characters' },
          }}
        >
          <PasswordField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label="Confirm password">
        <FormInput
          name="confirmPassword"
          rules={{
            required: 'Required',
            minLength: { value: 8, message: 'Minimum length 8 characters' },
            validate: samePassword,
          }}
        >
          <PasswordField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Save
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </FormButtons>
    </Form>
  );
}
