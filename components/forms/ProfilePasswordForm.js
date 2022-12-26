import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';
import { useApi } from 'next-basics';
import { useRef } from 'react';
import { SubmitButton, Form, FormButtons, FormInput, PasswordField } from 'react-basics';
import styles from './UserForm.module.css';
import useUser from 'hooks/useUser';

export default function UserPasswordForm({ onSave }) {
  const {
    user: { id },
  } = useUser();
  const { post } = useApi(getAuthToken());
  const { mutate, error } = useMutation(data => post(`/users/${id}/password`, data));
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
        <FormInput
          name="current_password"
          label="Current password"
          rules={{ required: 'Required' }}
        >
          <PasswordField autoComplete="off" />
        </FormInput>
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
        <FormButtons>
          <SubmitButton>Save</SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
