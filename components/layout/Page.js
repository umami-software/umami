import classNames from 'classnames';
import { Banner, Loading } from 'react-basics';
import useMessages from 'hooks/useMessages';
import styles from './Page.module.css';

export function Page({ className, error, loading, children }) {
  const { formatMessage, messages } = useMessages();

  if (error) {
    return <Banner variant="error">{formatMessage(messages.error)}</Banner>;
  }

  if (loading) {
    return <Loading icon="spinner" size="xl" position="page" />;
  }

  return <div className={classNames(styles.page, className)}>{children}</div>;
}

export default Page;
