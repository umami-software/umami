import { Icon, Text } from '@umami/react-zen';
import styles from './ErrorMessage.module.css';
import { useMessages } from '@/components/hooks';
import { Alert } from '@/components/icons';

export function ErrorMessage() {
  const { formatMessage, messages } = useMessages();

  return (
    <div className={styles.error}>
      <Icon className={styles.icon} size="lg">
        <Alert />
      </Icon>
      <Text>{formatMessage(messages.error)}</Text>
    </div>
  );
}
