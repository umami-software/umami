import { Loading } from 'react-basics';
import ErrorMessage from 'components/common/ErrorMessage';
import styles from './MetricsBar.module.css';

export function MetricsBar({ children, onClick, isLoading, isFetched, error }) {
  return (
    <div className={styles.bar} onClick={onClick}>
      {isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {children}
    </div>
  );
}

export default MetricsBar;
