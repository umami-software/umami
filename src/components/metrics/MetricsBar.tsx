import { ReactNode } from 'react';
import { Grid } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export interface MetricsBarProps {
  isLoading?: boolean;
  isFetched?: boolean;
  error?: Error;
  children?: ReactNode;
}

export function MetricsBar({ children, isLoading, isFetched, error }: MetricsBarProps) {
  return (
    <LoadingPanel isLoading={isLoading} isFetched={isFetched} error={error}>
      {!isLoading && !error && isFetched && (
        <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" width="100%" gap>
          {children}
        </Grid>
      )}
    </LoadingPanel>
  );
}
