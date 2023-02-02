import { useIntl } from 'react-intl';
import { Icon, Icons, Text } from 'react-basics';
import { messages } from 'components/messages';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage() {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.error}>
      <Icon className={styles.icon} size="large">
        <Icons.Alert />
      </Icon>
      <Text>{formatMessage(messages.error)}</Text>
    </div>
  );
}
