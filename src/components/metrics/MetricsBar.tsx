import { Box, Grid, type GridProps } from '@umami/react-zen';
import { createContext, type ReactNode, useContext } from 'react';
import styles from './MetricsBar.module.css';

const MetricsBarJoinedContext = createContext(false);

/** True inside a joined `MetricsBar`, where the bar draws the border and background, not each card. */
export function useMetricsBarJoined() {
  return useContext(MetricsBarJoinedContext);
}

export interface MetricsBarProps extends GridProps {
  /** Group the cards in one bordered container, separated by divider lines. Set false for separate cards. */
  joined?: boolean;
  children?: ReactNode;
}

export function MetricsBar({ joined = true, children, ...props }: MetricsBarProps) {
  if (joined) {
    return (
      <Box border borderRadius backgroundColor="surface" overflow="hidden">
        <Grid columns="repeat(auto-fit, minmax(160px, 1fr))" className={styles.joined} {...props}>
          <MetricsBarJoinedContext.Provider value={true}>
            {children}
          </MetricsBarJoinedContext.Provider>
        </Grid>
      </Box>
    );
  }

  return (
    <Grid columns="repeat(auto-fit, minmax(160px, 1fr))" gap {...props}>
      {children}
    </Grid>
  );
}
