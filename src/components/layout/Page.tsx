'use client';
import { ReactNode } from 'react';
import classNames from 'classnames';
import { AlertBanner, Loading } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import styles from './Page.module.css';

export function Page({
  className,
  error,
  isLoading,
  children,
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

  return <div className={classNames(styles.page, className)}>{children}</div>;
}
