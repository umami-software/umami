'use client';
import { AlertBanner, Column, type ColumnProps, Loading } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useMessages } from '@/components/hooks';

const DEFAULT_WIDTH = '1320px';

export function PageBody({
  maxWidth = DEFAULT_WIDTH,
  error,
  isLoading,
  children,
  ...props
}: {
  maxWidth?: string;
  error?: unknown;
  isLoading?: boolean;
  children?: ReactNode;
} & ColumnProps) {
  const { formatMessage, messages } = useMessages();

  if (error) {
    return <AlertBanner title={formatMessage(messages.error)} variant="error" />;
  }

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Column
      {...props}
      width="100%"
      paddingBottom="6"
      maxWidth={maxWidth}
      paddingX={{ xs: '3', md: '6' }}
      style={{ margin: '0 auto' }}
    >
      {children}
    </Column>
  );
}
