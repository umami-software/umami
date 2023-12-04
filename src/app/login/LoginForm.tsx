'use client';
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
import { useRouter } from 'next/navigation';
import useApi from 'components/hooks/useApi';
import { setUser } from 'store/app';
import { setClientAuthToken } from 'lib/client';
import useMessages from 'components/hooks/useMessages';
import Logo from 'assets/logo.svg';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { formatMessage, labels, getMessage } = useMessages();
  const router = useRouter();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/auth/login', data),
  });

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
      <Form className={styles.form} onSubmit={handleSubmit} error={getMessage(error)}>
        <FormRow label={formatMessage(labels.username)}>
          <FormInput name="username" rules={{ required: formatMessage(labels.required) }}>
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.password)}>
          <FormInput name="password" rules={{ required: formatMessage(labels.required) }}>
            <PasswordField />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton className={styles.button} variant="primary" disabled={isPending}>
            {formatMessage(labels.login)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </div>
  );
}

export default LoginForm;
