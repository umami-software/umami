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
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { Logo } from '@/components/svg';
import { authClient } from '@/lib/auth-client';

export function LoginForm() {
  const { t, labels, getErrorMessage } = useMessages();
  const router = useRouter();
  const [error, setError] = useState<Error | undefined>();

  const handleSubmit = async (data: any) => {
    setError(undefined);

    const { error: signInError } = await authClient.signIn.username({
      username: data.username,
      password: data.password,
    });

    if (signInError) {
      setError(
        Object.assign(new Error(signInError.message || 'Incorrect username and/or password.'), {
          code: 'incorrect-username-password',
        }),
      );
      return;
    }

    router.push('/');
  };

  return (
    <Column justifyContent="center" alignItems="center" gap="6">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>umami</Heading>
      <Form onSubmit={handleSubmit} error={getErrorMessage(error)} style={{ minWidth: 300 }}>
        <FormField
          label={t(labels.username)}
          data-test="input-username"
          name="username"
          rules={{ required: t(labels.required) }}
        >
          <TextField autoComplete="username" />
        </FormField>

        <FormField
          label={t(labels.password)}
          data-test="input-password"
          name="password"
          rules={{ required: t(labels.required) }}
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
            {t(labels.login)}
          </FormSubmitButton>
        </FormButtons>
      </Form>
    </Column>
  );
}
