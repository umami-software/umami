import classNames from 'classnames';
import styles from './Empty.module.css';
import useMessages from 'components/hooks/useMessages';

export function Empty({ message, className }) {
  const { formatMessage, messages } = useMessages();

  return (
    <div className={classNames(styles.container, className)}>
      {message || formatMessage(messages.noDataAvailable)}
    </div>
  );
}

export default Empty;
