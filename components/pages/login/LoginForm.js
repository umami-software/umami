import { useMutation } from '@tanstack/react-query';
import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  PasswordField,
  SubmitButton,
  Icon,
} from 'react-basics';
import { useRouter } from 'next/router';
import useApi from 'hooks/useApi';
import { setUser } from 'store/app';
import { setClientAuthToken } from 'lib/client';
import Logo from 'assets/logo.svg';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { post } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/auth/login', data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);

        await router.push('/dashboard');
      },
    });
  };

  return (
    <div className={styles.login}>
      <Icon className={styles.icon} size="xl">
        <Logo />
      </Icon>
      <div className={styles.title}>umami</div>
      <Form className={styles.form} onSubmit={handleSubmit} error={error}>
        <FormRow label="Username">
          <FormInput name="username" rules={{ required: 'Required' }}>
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label="Password">
          <FormInput name="password" rules={{ required: 'Required' }}>
            <PasswordField />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton className={styles.button} variant="primary" disabled={isLoading}>
            Log in
          </SubmitButton>
        </FormButtons>
      </Form>
    </div>
  );
}
