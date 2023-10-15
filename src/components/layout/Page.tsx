'use client';
import { ReactNode } from 'react';
import classNames from 'classnames';
import { Banner, Loading } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
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
    return <Banner variant="error">{formatMessage(messages.error)}</Banner>;
  }

  if (isLoading) {
    return <Loading icon="spinner" size="xl" position="page" />;
  }

  return <div className={classNames(styles.page, className)}>{children}</div>;
}

export default Page;
