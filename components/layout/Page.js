import classNames from 'classnames';
import { Banner, Loading } from 'react-basics';
import styles from './Page.module.css';

export default function Page({ className, error, loading, children }) {
  if (error) {
    return <Banner variant="error">Something went wrong.</Banner>;
  }

  if (loading) {
    return <Loading icon="spinner" size="xl" position="page" />;
  }

  return <div className={classNames(styles.page, className)}>{children}</div>;
}
