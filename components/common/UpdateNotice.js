import React from 'react';
import { FormattedMessage } from 'react-intl';
import useVersion from 'hooks/useVersion';
import styles from './UpdateNotice.module.css';
import ButtonLayout from '../layout/ButtonLayout';
import Button from './Button';
import useForceUpdate from '../../hooks/useForceUpdate';

export default function UpdateNotice() {
  const forceUpdate = useForceUpdate();
  const { hasUpdate, checked, latest, updateCheck } = useVersion(true);

  function handleViewClick() {
    location.href = 'https://github.com/mikecao/umami/releases';
    updateCheck();
    forceUpdate();
  }

  function handleDismissClick() {
    updateCheck();
    forceUpdate();
  }

  if (!hasUpdate || checked) {
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
        <Button size="xsmall" variant="action" onClick={handleViewClick}>
          <FormattedMessage id="label.view-details" defaultMessage="View details" />
        </Button>
        <Button size="xsmall" onClick={handleDismissClick}>
          <FormattedMessage id="label.dismiss" defaultMessage="Dismiss" />
        </Button>
      </ButtonLayout>
    </div>
  );
}
