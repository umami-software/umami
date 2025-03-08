import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as Boundary } from 'react-error-boundary';
import { Button } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import styles from './ErrorBoundary.module.css';

const logError = (error: Error, info: ErrorInfo) => {
  // eslint-disable-next-line no-console
  console.error(error, info.componentStack);
};

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { formatMessage, messages } = useMessages();

  const fallbackRender = ({ error, resetErrorBoundary }) => {
    return (
      <div className={styles.error} role="alert">
        <h1>{formatMessage(messages.error)}</h1>
        <h3>{error.message}</h3>
        <pre>{error.stack}</pre>
        <Button onClick={resetErrorBoundary}>OK</Button>
      </div>
    );
  };

  return (
    <Boundary fallbackRender={fallbackRender} onError={logError}>
      {children}
    </Boundary>
  );
}
