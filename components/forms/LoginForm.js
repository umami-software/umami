import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Form,
  FormInput,
  FormButtons,
  TextField,
  PasswordField,
  SubmitButton,
  Icon,
} from 'react-basics';
import { useRouter } from 'next/router';
import { useApi } from 'next-basics';
import { setUser } from 'store/app';
import { setAuthToken } from 'lib/client';
import Logo from 'assets/logo.svg';
import styles from './Form.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { post } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/auth/login', data));
  const ref = useRef();

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async ({ token, account }) => {
        setAuthToken(token);
        setUser(account);

        await router.push('/websites');
      },
      onError: async () => {
        ref.current.reset(undefined, { keepDirty: true, keepValues: true });
      },
    });
  };

  return (
    <>
      <div className={styles.header}>
        <Icon size="xl">
          <Logo />
        </Icon>
        <p>umami</p>
      </div>
      <Form ref={ref} className={styles.form} onSubmit={handleSubmit} error={error}>
        <FormInput name="username" label="Username" rules={{ required: 'Required' }}>
          <TextField autoComplete="off" />
        </FormInput>
        <FormInput name="password" label="Password" rules={{ required: 'Required' }}>
          <PasswordField />
        </FormInput>
        <FormButtons>
          <SubmitButton variant="primary" className={styles.button} disabled={isLoading}>
            Log in
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
