import { ReactNode } from 'react';
import { Spinner, Dots, Column, type ColumnProps } from '@umami/react-zen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Empty } from '@/components/common/Empty';

export function LoadingPanel({
  error,
  isEmpty,
  isFetched,
  isLoading,
  loadingIcon = 'dots',
  renderEmpty = () => <Empty />,
  children,
  ...props
}: {
  error?: Error;
  isEmpty?: boolean;
  isFetched?: boolean;
  isLoading?: boolean;
  loadingIcon?: 'dots' | 'spinner';
  renderEmpty?: () => ReactNode;
  children: ReactNode;
} & ColumnProps) {
  return (
    <Column {...props}>
      {isLoading && !isFetched && (loadingIcon === 'dots' ? <Dots /> : <Spinner />)}
      {error && <ErrorMessage />}
      {!error && !isLoading && isEmpty && renderEmpty()}
      {!error && !isLoading && !isEmpty && children}
    </Column>
  );
}
