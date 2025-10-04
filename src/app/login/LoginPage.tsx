'use client';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
