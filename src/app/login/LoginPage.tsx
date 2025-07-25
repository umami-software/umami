'use client';
import { useConfig } from '@/components/hooks';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const config = useConfig();

  if (config?.loginDisabled) {
    return null;
  }

  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
