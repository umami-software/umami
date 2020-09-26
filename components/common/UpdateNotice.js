import React from 'react';
import { FormattedMessage } from 'react-intl';
import useVersion from '../../hooks/useVersion';
import Link from '../common/Link';
import styles from './UpdateNotice.module.css';

export default function UpdateNotice() {
  const versions = useVersion();
  console.log(versions);
  if (!versions) return null;

  const { current, latest } = versions;

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <FormattedMessage
          id="message.new-version-available"
          default="Version {latest} available! Current version: {current}"
          values={{
            latest: latest,
            current: current,
          }}
        />
      </div>
      <Link href="https://github.com/mikecao/umami" size="xsmall">
        <div className={styles.message}>
          <FormattedMessage
            id="message.visit-github-update"
            default="Click here to visit umami on github for instructions"
          />
        </div>
      </Link>
    </div>
  );
}
