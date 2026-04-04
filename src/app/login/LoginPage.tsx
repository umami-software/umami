'use client';
import { Column } from '@umami/react-zen';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      height="100vh"
      backgroundColor="surface-raised"
      style={{ paddingTop: '15vh' }}
    >
      <LoginForm />
    </Column>
  );
}
