import { ReactNode } from 'react';
import classNames from 'classnames';
import { Spinner, Dots } from '@umami/react-zen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Empty } from '@/components/common/Empty';
import styles from './LoadingPanel.module.css';

export function LoadingPanel({
  error,
  isEmpty,
  isFetched,
  isLoading,
  loadingIcon = 'dots',
  renderEmpty = () => <Empty />,
  className,
  children,
}: {
  data?: any;
  error?: Error;
  isEmpty?: boolean;
  isFetched?: boolean;
  isLoading?: boolean;
  loadingIcon?: 'dots' | 'spinner';
  renderEmpty?: () => ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={classNames(styles.panel, className)}>
      {isLoading && !isFetched && (loadingIcon === 'dots' ? <Dots /> : <Spinner />)}
      {error && <ErrorMessage />}
      {!error && !isLoading && isEmpty && renderEmpty()}
      {!error && !isLoading && !isEmpty && children}
    </div>
  );
}
