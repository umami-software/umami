import { ReactNode } from 'react';
import { Grid, Loading } from '@umami/react-zen';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export interface MetricsBarProps {
  isLoading?: boolean;
  isFetched?: boolean;
  error?: unknown;
  children?: ReactNode;
}

export function MetricsBar({ children, isLoading, isFetched, error }: MetricsBarProps) {
  return (
    <>
      {isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {!isLoading && !error && isFetched && (
        <Grid columns="repeat(auto-fill, minmax(200px, 1fr))" width="100%" gapY="3">
          {children}
        </Grid>
      )}
    </>
  );
}
