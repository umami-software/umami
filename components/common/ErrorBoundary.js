/* eslint-disable no-console */
import { ErrorBoundary as Boundary } from 'react-error-boundary';
import { Button } from 'react-basics';
import useMessages from 'hooks/useMessages';
import styles from './ErrorBoundry.module.css';

const logError = (error, info) => {
  console.error(error, info.componentStack);
};

export function ErrorBoundary({ children }) {
  const { formatMessage, messages } = useMessages();

  const fallbackRender = ({ error, resetErrorBoundary }) => {
    console.log({ error });
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

export default ErrorBoundary;
