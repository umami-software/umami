import classNames from 'classnames';
import styles from './NoData.module.css';
import useMessages from 'hooks/useMessages';

function NoData({ className }) {
  const { formatMessage, messages } = useMessages();

  return (
    <div className={classNames(styles.container, className)}>{formatMessage(messages.noData)}</div>
  );
}

export default NoData;
