import { useRef } from 'react';
import { Form, FormInput, FormButtons, PasswordField, Button } from 'react-basics';
import { useApi } from 'next-basics';
import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';
import styles from './Form.module.css';

export default function PasswordResetForm({ token, onSave }) {
  const { post } = useApi(getAuthToken());
  const { mutate, error, isLoading } = useMutation(data =>
    post('/account/reset-password', { ...data, token }),
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
    if (value !== ref?.current?.getValues('new_password')) {
      return "Passwords don't match";
    }
    return true;
  };

  return (
    <>
      <Form ref={ref} className={styles.form} onSubmit={handleSubmit} error={error}>
        <h2>Reset your password</h2>
        <FormInput name="new_password" label="New password" rules={{ required: 'Required' }}>
          <PasswordField autoComplete="off" />
        </FormInput>
        <FormInput
          name="confirm_password"
          label="Confirm password"
          rules={{ required: 'Required', validate: samePassword }}
        >
          <PasswordField autoComplete="off" />
        </FormInput>
        <FormButtons align="center" className={styles.buttons}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            Update password
          </Button>
        </FormButtons>
      </Form>
    </>
  );
}
