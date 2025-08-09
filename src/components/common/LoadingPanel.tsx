import { ReactNode } from 'react';
import { Loading, Column, type ColumnProps } from '@umami/react-zen';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Empty } from '@/components/common/Empty';

export interface LoadingPanelProps extends ColumnProps {
  data?: any;
  error?: Error;
  isEmpty?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  loadingIcon?: 'dots' | 'spinner';
  renderEmpty?: () => ReactNode;
  children: ReactNode;
}

export function LoadingPanel({
  data,
  error,
  isEmpty,
  isLoading,
  isFetching,
  loadingIcon = 'dots',
  renderEmpty = () => <Empty />,
  children,
  ...props
}: LoadingPanelProps) {
  const empty = isEmpty ?? checkEmpty(data);

  return (
    <Column position="relative" flexGrow={1} overflow="hidden" {...props}>
      {/* Show loading spinner only if no data exists */}
      {(isLoading || isFetching) && !data && <Loading icon={loadingIcon} position="page" />}

      {/* Show error */}
      {error && <ErrorMessage />}

      {/* Show empty state (once loaded) */}
      {!error && !isLoading && !isFetching && empty && renderEmpty()}

      {/* Show main content when data exists */}
      {!error && !empty && children}
    </Column>
  );
}

function checkEmpty(data: any) {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.length <= 0;
  }

  if (typeof data === 'object') {
    return Object.keys(data).length <= 0;
  }

  return !!data;
}
