import { useState, useEffect, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import ButtonLayout from 'components/layout/ButtonLayout';
import useStore, { checkVersion } from 'store/version';
import { setItem } from 'lib/web';
import { REPO_URL, VERSION_CHECK } from 'lib/constants';
import Button from './Button';
import styles from './UpdateNotice.module.css';
import useUser from 'hooks/useUser';
import useConfig from 'hooks/useConfig';

export default function UpdateNotice() {
  const { user } = useUser();
  const { updatesDisabled } = useConfig();
  const { latest, checked, hasUpdate, releaseUrl } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const allowCheck = user?.is_admin && !updatesDisabled;

  const updateCheck = useCallback(() => {
    setItem(VERSION_CHECK, { version: latest, time: Date.now() });
  }, [latest]);

  function handleViewClick() {
    updateCheck();
    setDismissed(true);
    location.href = releaseUrl || REPO_URL;
  }

  function handleDismissClick() {
    updateCheck();
    setDismissed(true);
  }

  useEffect(() => {
    if (!checked && allowCheck) {
      checkVersion();
    }
  }, [checked]);

  if (!hasUpdate || dismissed || !allowCheck) {
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
      <ButtonLayout className={styles.buttons}>
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
