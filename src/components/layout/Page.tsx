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
    <Column
      {...props}
      gridColumn="2 / 3"
      gridRow="2 / 3"
      marginRight="6"
      marginBottom="6"
      width="100%"
      maxWidth="1320px"
      minHeight="600px"
      margin="auto"
      backgroundColor="1"
      overflow="auto"
      borderRadius="3"
      borderSize="1"
      paddingX="8"
      paddingY="4"
    >
      {children}
    </Column>
  );
}
