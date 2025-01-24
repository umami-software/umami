import classNames from 'classnames';
import { useMessages } from 'components/hooks';
import styles from './Empty.module.css';

export interface EmptyProps {
  message?: string;
  className?: string;
}

export function Empty({ message, className }: EmptyProps) {
  const { formatMessage, messages } = useMessages();

  return (
    <div className={classNames(styles.container, className)}>
      {message || formatMessage(messages.noDataAvailable)}
    </div>
  );
}

export default Empty;
