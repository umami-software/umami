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
import styles from './Form.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { post } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/auth/login', data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);

        await router.push('/websites');
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
          <SubmitButton variant="primary" className={styles.button} disabled={isLoading}>
            Log in
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}
