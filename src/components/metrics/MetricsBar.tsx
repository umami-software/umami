import { ReactNode } from 'react';
import { Grid, GridProps } from '@umami/react-zen';

export interface MetricsBarProps extends GridProps {
  children?: ReactNode;
}

export function MetricsBar({ children, ...props }: MetricsBarProps) {
  return (
    <Grid columns="repeat(auto-fit, minmax(160px, 1fr))" gap {...props}>
      {children}
    </Grid>
  );
}
