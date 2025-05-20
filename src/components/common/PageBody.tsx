'use client';
import { ReactNode } from 'react';
import { AlertBanner, Loading, Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export function PageBody({
  maxWidth = '1600px',
  error,
  isLoading,
  children,
  ...props
}: {
  maxWidth?: string;
  error?: unknown;
  isLoading?: boolean;
  children?: ReactNode;
}) {
  const { formatMessage, messages } = useMessages();

  if (error) {
    return <AlertBanner title={formatMessage(messages.error)} variant="error" />;
  }

  if (isLoading) {
    return <Loading position="page" />;
  }

  return (
    <Column {...props} width="100%" paddingBottom="9" style={{ margin: '0 auto', maxWidth }}>
      {children}
    </Column>
  );
}
