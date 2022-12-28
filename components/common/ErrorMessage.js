import Exclamation from 'assets/exclamation-triangle.svg';
import { FormattedMessage } from 'react-intl';
import styles from './ErrorMessage.module.css';
import { Icon } from 'react-basics';

export default function ErrorMessage() {
  return (
    <div className={styles.error}>
      <Icon className={styles.icon} size="large">
        <Exclamation />
      </Icon>
      <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />
    </div>
  );
}
