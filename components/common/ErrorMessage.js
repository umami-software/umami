import { Icon, Icons, Text } from 'react-basics';
import styles from './ErrorMessage.module.css';
import useMessages from 'hooks/useMessages';

export default function ErrorMessage() {
  const { formatMessage, messages } = useMessages();

  return (
    <div className={styles.error}>
      <Icon className={styles.icon} size="large">
        <Icons.Alert />
      </Icon>
      <Text>{formatMessage(messages.error)}</Text>
    </div>
  );
}
