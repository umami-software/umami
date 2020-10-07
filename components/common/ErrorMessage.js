import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import Exclamation from 'assets/exclamation-triangle.svg';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage() {
  return (
    <div className={styles.error}>
      <Icon icon={<Exclamation />} className={styles.icon} size="large" />
      <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />
    </div>
  );
}
