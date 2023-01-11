import { useRef } from 'react';
import { Form, FormRow, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';

export default function UserPasswordForm({ onSave, onClose, userId }) {
  const user = useUser();

  const isCurrentUser = !userId || user?.id === userId;
  const url = isCurrentUser ? `/users/${user?.id}/password` : `/users/${user?.id}`;
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post(url, data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    const payload = isCurrentUser
      ? data
      : {
          password: data.newPassword,
        };

    mutate(payload, {
      onSuccess: async () => {
        onSave();
        ref.current.reset();
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
      {isCurrentUser && (
        <FormRow label="Current password">
          <FormInput name="currentPassword" rules={{ required: 'Required' }}>
            <PasswordField autoComplete="off" />
          </FormInput>
        </FormRow>
      )}
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
        <Button onClick={onClose}>Close</Button>
      </FormButtons>
    </Form>
  );
}
