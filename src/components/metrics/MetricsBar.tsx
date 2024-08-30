import { ReactNode } from 'react';
import { Loading, cloneChildren } from 'react-basics';
import ErrorMessage from 'components/common/ErrorMessage';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';
import styles from './MetricsBar.module.css';

export interface MetricsBarProps {
  isLoading?: boolean;
  isFetched?: boolean;
  error?: unknown;
  children?: ReactNode;
}

export function MetricsBar({ children, isLoading, isFetched, error }: MetricsBarProps) {
  const intl = useIntl();
  const formatFunc = (n: number) => intl.formatNumber(n, formatLongNumberOptions(n));

  return (
    <div className={styles.bar}>
      {isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {!isLoading &&
        !error &&
        isFetched &&
        cloneChildren(children, child => {
          return { format: child.props.format || formatFunc };
        })}
    </div>
  );
}

export default MetricsBar;
