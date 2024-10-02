'use client';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  if (process.env.disableLogin) {
    return null;
  }

  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
