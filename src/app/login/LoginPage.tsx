'use client';
import { Column } from '@umami/react-zen';
import { LoginForm } from './LoginForm';
import { PropsWithChildren } from 'react';

export function LoginPageWrapper({ children }: PropsWithChildren) {
  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      height="100vh"
      backgroundColor="surface-raised"
      style={{ paddingTop: '15vh' }}
    >
      {children}
    </Column>
  );
}

export function LoginPage() {
  return (
    <LoginPageWrapper>
      <LoginForm />
    </LoginPageWrapper>
  );
}
