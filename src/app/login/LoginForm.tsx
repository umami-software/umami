import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  PasswordField,
  SubmitButton,
  Icon,
  Button,
} from 'react-basics';
import { useRouter } from 'next/navigation';
import { useApi, useMessages } from '@/components/hooks';
import { setUser } from '@/store/app';
import { setClientAuthToken } from '@/lib/client';
import Logo from '@/assets/logo.svg';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/auth/login', data),
  });
  const { mutate: startOIDC, isPending: isOIDC } = useMutation({
    mutationFn: async (returnUrl?: string) => {
      const res = await fetch(
        `/api/auth/oidc/authorize?returnUrl=${encodeURIComponent(returnUrl || '/dashboard')}`,
      );
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
      return data;
    },
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);

        router.push('/dashboard');
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
        <FormRow label={formatMessage(labels.username)}>
          <FormInput
            data-test="input-username"
            name="username"
            rules={{ required: formatMessage(labels.required) }}
          >
            <TextField autoComplete="off" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.password)}>
          <FormInput
            data-test="input-password"
            name="password"
            rules={{ required: formatMessage(labels.required) }}
          >
            <PasswordField />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton
            data-test="button-submit"
            className={styles.button}
            variant="primary"
            disabled={isPending}
          >
            {formatMessage(labels.login)}
          </SubmitButton>
          <Button
            variant="secondary"
            onClick={() => startOIDC('/dashboard')}
            disabled={isOIDC}
            className={styles.button}
          >
            Se connecter avec OIDC
          </Button>
        </FormButtons>
      </Form>
    </div>
  );
}

export default LoginForm;
