import { useRef } from 'react';
import { Form, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import { useApi } from 'next-basics';
import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';
import styles from './UserPasswordForm.module.css';
import useUser from 'hooks/useUser';

export default function UserPasswordForm({ onSave, userId }) {
  const {
    user: { id },
  } = useUser();

  const isCurrentUser = !userId || id === userId;
  const url = isCurrentUser ? `/users/${id}/password` : `/users/${id}`;
  const { post } = useApi(getAuthToken());
  const { mutate, error, isLoading } = useMutation(data => post(url, data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    const payload = isCurrentUser
      ? data
      : {
          password: data.new_password,
        };

    mutate(payload, {
      onSuccess: async () => {
        onSave();
        ref.current.reset();
      },
    });
  };

  const samePassword = value => {
    if (value !== ref?.current?.getValues('new_password')) {
      return "Passwords don't match";
    }
    return true;
  };

  return (
    <Form ref={ref} className={styles.form} onSubmit={handleSubmit} error={error}>
      {isCurrentUser && (
        <FormInput
          name="current_password"
          label="Current password"
          rules={{ required: 'Required' }}
        >
          <PasswordField autoComplete="off" />
        </FormInput>
      )}
      <FormInput
        name="new_password"
        label="New password"
        rules={{
          required: 'Required',
          minLength: { value: 8, message: 'Minimum length 8 characters' },
        }}
      >
        <PasswordField autoComplete="off" />
      </FormInput>
      <FormInput
        name="confirm_password"
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
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </FormButtons>
    </Form>
  );
}
