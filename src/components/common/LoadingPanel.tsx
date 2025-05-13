import { ReactNode } from 'react';
import classNames from 'classnames';
import { Loading } from 'react-basics';
import ErrorMessage from '@/components/common/ErrorMessage';
import Empty from '@/components/common/Empty';
import styles from './LoadingPanel.module.css';

export function LoadingPanel({
  data,
  error,
  isFetched,
  isLoading,
  loadingIcon = 'dots',
  className,
  children,
}: {
  data?: any;
  error?: Error;
  isFetched?: boolean;
  isLoading?: boolean;
  loadingIcon?: 'dots' | 'spinner';
  isEmpty?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const isEmpty = !isLoading && isFetched && data && Array.isArray(data) && data.length === 0;

  return (
    <div className={classNames(styles.panel, className)}>
      {isLoading && !isFetched && <Loading className={styles.loading} icon={loadingIcon} />}
      {error && <ErrorMessage />}
      {!error && isEmpty && <Empty />}
      {!error && !isEmpty && data && children}
    </div>
  );
}
