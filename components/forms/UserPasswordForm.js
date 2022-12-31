import { useRef } from 'react';
import { Form, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import useApi from 'hooks/useApi';
import styles from './UserPasswordForm.module.css';
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
    <Form ref={ref} className={styles.form} onSubmit={handleSubmit} error={error}>
      {isCurrentUser && (
        <FormInput name="currentPassword" label="Current password" rules={{ required: 'Required' }}>
          <PasswordField autoComplete="off" />
        </FormInput>
      )}
      <FormInput
        name="newPassword"
        label="New password"
        rules={{
          required: 'Required',
          minLength: { value: 8, message: 'Minimum length 8 characters' },
        }}
      >
        <PasswordField autoComplete="off" />
      </FormInput>
      <FormInput
        name="confirmPassword"
        label="Confirm password"
        rules={{
          required: 'Required',
          minLength: { value: 8, message: 'Minimum length 8 characters' },
          validate: samePassword,
        }}
      >
        <PasswordField autoComplete="off" />
      </FormInput>
      <FormButtons flex>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Save
        </Button>
        <Button onClick={onClose}>Close</Button>
      </FormButtons>
    </Form>
  );
}
