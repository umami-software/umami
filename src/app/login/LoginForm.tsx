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
import { useMessages } from '@/components/hooks';
import Logo from '@/assets/logo.svg';
import styles from './LoginForm.module.css';
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      throw new Error(res.error);
    }

    router.push('/dashboard');
  };

  return (
    <div className={styles.login}>
      <Icon className={styles.icon} size="xl">
        <Logo />
      </Icon>
      <div className={styles.title}>umami</div>
      <Form className={styles.form} onSubmit={handleSubmit}>
        <FormRow label={formatMessage(labels.email)}>
          <FormInput
            data-test="input-username"
            name="email"
            rules={{ required: formatMessage(labels.required) }}
          >
            <TextField autoComplete="email" />
          </FormInput>
        </FormRow>
        <FormRow label={formatMessage(labels.password)}>
          <FormInput
            data-test="input-password"
            name="password"
            rules={{ required: formatMessage(labels.required) }}
          >
            <PasswordField autoComplete="current-password" />
          </FormInput>
        </FormRow>
        <FormButtons>
          <SubmitButton data-test="button-submit" className={styles.button} variant="primary">
            {formatMessage(labels.login)}
          </SubmitButton>
        </FormButtons>
      </Form>
    </div>
  );
}

export default LoginForm;
