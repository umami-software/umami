import React from 'react';
import { FormattedMessage } from 'react-intl';
import semver from 'semver';
import useVersion from 'hooks/useVersion';
import styles from './UpdateNotice.module.css';
import ButtonLayout from '../layout/ButtonLayout';
import Button from './Button';

export default function UpdateNotice() {
  const versions = useVersion();

  if (!versions) {
    return null;
  }

  const { current, latest } = versions;

  if (latest && semver.gte(current, latest)) {
    return null;
  }

  return (
    <div className={styles.notice}>
      <div className={styles.message}>
        <FormattedMessage
          id="message.new-version-available"
          defaultMessage="A new version of umami {version} is available!"
          values={{ version: `v${latest}` }}
        />
      </div>
      <ButtonLayout>
        <Button size="xsmall" variant="action">
          <FormattedMessage id="button.view-details" defaultMessage="View details" />
        </Button>
        <Button size="xsmall">
          <FormattedMessage id="button.dismiss" defaultMessage="Dismiss" />
        </Button>
      </ButtonLayout>
    </div>
  );
}
