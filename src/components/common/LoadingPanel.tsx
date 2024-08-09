import { ReactNode } from 'react';
import styles from './LoadingPanel.module.css';
import classNames from 'classnames';
import ErrorMessage from 'components/common/ErrorMessage';
import { Loading } from 'react-basics';
import Empty from 'components/common/Empty';

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
  const isEmpty = !data?.length && !isLoading && isFetched;

  return (
    <div className={classNames(styles.panel, className)}>
      {isLoading && !isFetched && <Loading icon={loadingIcon} />}
      {error && <ErrorMessage />}
      {!error && isEmpty && <Empty />}
      {!error && !isEmpty && data && children}
    </div>
  );
}
