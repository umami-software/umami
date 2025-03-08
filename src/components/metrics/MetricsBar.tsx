import { ReactNode } from 'react';
import { Loading, Row } from '@umami/react-zen';
import { cloneChildren } from '@/lib/react';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatLongNumber } from '@/lib/format';

export interface MetricsBarProps {
  isLoading?: boolean;
  isFetched?: boolean;
  error?: unknown;
  children?: ReactNode;
}

export function MetricsBar({ children, isLoading, isFetched, error }: MetricsBarProps) {
  const formatFunc = n => (n >= 0 ? formatLongNumber(n) : `-${formatLongNumber(Math.abs(n))}`);

  return (
    <Row>
      {isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {!isLoading &&
        !error &&
        isFetched &&
        cloneChildren(children, child => {
          return { format: child.props['format'] || formatFunc };
        })}
    </Row>
  );
}
