import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Row, Column } from 'react-basics';
import { setItem } from 'next-basics';
import useStore, { checkVersion } from 'store/version';
import { REPO_URL, VERSION_CHECK } from 'lib/constants';
import styles from './UpdateNotice.module.css';
import useMessages from 'components/hooks/useMessages';
import { useRouter } from 'next/router';

export function UpdateNotice({ user, config }) {
  const { formatMessage, labels, messages } = useMessages();
  const { latest, checked, hasUpdate, releaseUrl } = useStore();
  const { pathname } = useRouter();
  const [dismissed, setDismissed] = useState(checked);
  const allowUpdate =
    user?.isAdmin &&
    !config?.updatesDisabled &&
    !config?.cloudMode &&
    !pathname.includes('/share/') &&
    !dismissed;

  const updateCheck = useCallback(() => {
    setItem(VERSION_CHECK, { version: latest, time: Date.now() });
  }, [latest]);

  function handleViewClick() {
    updateCheck();
    setDismissed(true);
    open(releaseUrl || REPO_URL, '_blank');
  }

  function handleDismissClick() {
    updateCheck();
    setDismissed(true);
  }

  useEffect(() => {
    if (allowUpdate) {
      checkVersion();
    }
  }, [allowUpdate]);

  if (!allowUpdate || !hasUpdate) {
    return null;
  }

  return createPortal(
    <Row className={styles.notice}>
      <Column variant="two" className={styles.message}>
        {formatMessage(messages.newVersionAvailable, { version: `v${latest}` })}
      </Column>
      <Column className={styles.buttons}>
        <Button variant="primary" onClick={handleViewClick}>
          {formatMessage(labels.viewDetails)}
        </Button>
        <Button onClick={handleDismissClick}>{formatMessage(labels.dismiss)}</Button>
      </Column>
    </Row>,
    document.body,
  );
}

export default UpdateNotice;
