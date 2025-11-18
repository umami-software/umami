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
import { Logo } from '@/components/svg';

export function LoginForm() {
  const { formatMessage, labels, getErrorMessage } = useMessages();
  const router = useRouter();
  const { mutateAsync, error } = useUpdateQuery('/auth/login');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async ({ token, user }) => {
        setClientAuthToken(token);
        setUser(user);

        router.push('/websites');
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
        </FormButtons>
      </Form>
    </Column>
  );
}
