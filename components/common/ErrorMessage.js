import { FormattedMessage } from 'react-intl';
import { Icon, Icons } from 'react-basics';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage() {
  return (
    <div className={styles.error}>
      <Icon className={styles.icon} size="large">
        <Icons.Alert />
      </Icon>
      <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />
    </div>
  );
}
