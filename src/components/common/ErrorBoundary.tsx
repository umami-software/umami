import { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as Boundary } from 'react-error-boundary';
import { Button, Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

const logError = (error: Error, info: ErrorInfo) => {
  // eslint-disable-next-line no-console
  console.error(error, info.componentStack);
};

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { formatMessage, messages } = useMessages();

  const fallbackRender = ({ error, resetErrorBoundary }) => {
    return (
      <Column
        role="alert"
        gap
        width="100%"
        height="100%"
        position="absolute"
        justifyContent="center"
        alignItems="center"
      >
        <h1>{formatMessage(messages.error)}</h1>
        <h3>{error.message}</h3>
        <pre>{error.stack}</pre>
        <Button onClick={resetErrorBoundary}>OK</Button>
      </Column>
    );
  };

  return (
    <Boundary fallbackRender={fallbackRender} onError={logError}>
      {children}
    </Boundary>
  );
}
