import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';
import { useApi } from 'next-basics';
import { useRef } from 'react';
import { SubmitButton, Form, FormButtons, FormInput, PasswordField } from 'react-basics';
import styles from './UserForm.module.css';

export default function UserPasswordForm({ data, onSave }) {
  const { id } = data;
  const { post } = useApi(getAuthToken());
  const { mutate, error } = useMutation(({ password }) => post(`/users/${id}`, { password }));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(
      { password: data.new_password },
      {
        onSuccess: async () => {
          onSave();
        },
      },
    );
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
