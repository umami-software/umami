import {
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Heading,
  Icon,
  PasswordField,
  TextField,
  Button,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useApi, useMessages, useUpdateQuery } from '@/components/hooks';
import { Logo } from '@/components/svg';
import { setClientAuthToken } from '@/lib/client';
import { setUser } from '@/store/app';

export function LoginForm() {
  const { formatMessage, labels, getErrorMessage } = useMessages();
  const router = useRouter();
  const { mutateAsync, error } = useUpdateQuery('/auth/login');
  const { useMutation } = useApi();
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
    await mutateAsync(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);
        router.push('/');
      },
    });
  };

  return (
    <Column justifyContent="center" alignItems="center" gap="6">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>umami</Heading>
      <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
        <FormField
          label={formatMessage(labels.username)}
          data-test="input-username"
          name="username"
          rules={{ required: formatMessage(labels.required) }}
        >
          <TextField autoComplete="username" />
        </FormField>

        <FormField
          label={formatMessage(labels.password)}
          data-test="input-password"
          name="password"
          rules={{ required: formatMessage(labels.required) }}
        >
          <PasswordField autoComplete="current-password" />
        </FormField>
        <FormButtons>
          <FormSubmitButton
            data-test="button-submit"
            variant="primary"
            style={{ flex: 1 }}
            isDisabled={false}
          >
            {formatMessage(labels.login)}
          </FormSubmitButton>
          <Button
            variant="secondary"
            onClick={() => startOIDC('/dashboard')}
            isDisabled={isOIDC}
            style={{ flex: 1 }}
          >
            Se connecter avec OIDC
          </Button>
        </FormButtons>
      </Form>
    </Column>
  );
}
