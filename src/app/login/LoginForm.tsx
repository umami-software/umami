import {
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
  PasswordField,
  Icon,
  Column,
  Heading,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { setUser } from '@/store/app';
import { setClientAuthToken } from '@/lib/client';
import { Logo } from '@/components/icons';

export function LoginForm() {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { mutate, error, isPending } = useUpdateQuery('/auth/login');

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
    <Column justifyContent="center" alignItems="center" padding="8" gap="6">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>umami</Heading>
      <Form onSubmit={handleSubmit} error={error}>
        <FormField
          label={formatMessage(labels.username)}
          data-test="input-username"
          name="username"
          rules={{ required: formatMessage(labels.required) }}
        >
          <TextField autoComplete="off" />
        </FormField>
        <FormField
          label={formatMessage(labels.password)}
          data-test="input-password"
          name="password"
          rules={{ required: formatMessage(labels.required) }}
        >
          <PasswordField />
        </FormField>
        <FormButtons>
          <FormSubmitButton
            data-test="button-submit"
            variant="primary"
            isDisabled={isPending}
            style={{ flex: 1 }}
          >
            {formatMessage(labels.login)}
          </FormSubmitButton>
        </FormButtons>
      </Form>
    </Column>
  );
}
