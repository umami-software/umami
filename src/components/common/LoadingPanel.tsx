import { Column, type ColumnProps, Loading } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { Empty } from '@/components/common/Empty';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface LoadingPanelProps extends ColumnProps {
  data?: any;
  error?: unknown;
  isEmpty?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  loadingIcon?: 'dots' | 'spinner';
  loadingPlacement?: 'center' | 'absolute' | 'inline';
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
  loadingPlacement = 'absolute',
  renderEmpty = () => <Empty />,
  children,
  ...props
}: LoadingPanelProps): ReactNode {
  const empty = isEmpty ?? checkEmpty(data);
  const hasData = data && !empty;

  // Show loading only on initial load when no data exists yet
  // Don't show loading during background refetches when we already have data
  if ((isLoading || isFetching) && !hasData) {
    return (
      <Column position="relative" height="100%" width="100%" {...props}>
        <Loading icon={loadingIcon} placement={loadingPlacement} />
      </Column>
    );
  }

  // Show error
  if (error) {
    return <ErrorMessage />;
  }

  // Show empty state (once loaded)
  if (!error && !isLoading && !isFetching && empty) {
    return renderEmpty();
  }

  // Show content when we have data (even during background refetch)
  if (hasData) {
    return children;
  }

  return null;
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
