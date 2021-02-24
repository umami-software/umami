import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import Exclamation from 'assets/exclamation-triangle.svg';
import styles from './ErrorMessage.module.css';

const DEFAULT_ID = 'message.failure';
const DEFAULT_MESSAGE = 'Something went wrong';

function ErrorMessage({ error }) {
  const [id, defaultMessage] =
    typeof error === 'string' ? error.split('\t') : [DEFAULT_ID, DEFAULT_MESSAGE];

  return (
    <div className={styles.error}>
      <Icon icon={<Exclamation />} className={styles.icon} size="large" />
      <FormattedMessage id={id} defaultMessage={defaultMessage} />
    </div>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
};

export default ErrorMessage;
