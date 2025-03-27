'use client';
import { ReactNode } from 'react';
import { AlertBanner, Loading, Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export function Page({
  error,
  isLoading,
  children,
  ...props
}: {
  className?: string;
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
    <Column {...props} width="100%" maxWidth="1320px" margin="auto" paddingBottom="9">
      {children}
    </Column>
  );
}
