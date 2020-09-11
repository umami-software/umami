import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import styles from './NoData.module.css';

export default function NoData({ className }) {
  return (
    <div className={classNames(styles.container, className)}>
      <FormattedMessage id="message.no-data-available" defaultMessage="No data available." />
    </div>
  );
}
