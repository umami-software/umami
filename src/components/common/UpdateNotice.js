'use client';
import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'react-basics';
import { setItem } from 'next-basics';
import useStore, { checkVersion } from 'store/version';
import { REPO_URL, VERSION_CHECK } from 'lib/constants';
import styles from './UpdateNotice.module.css';
import useMessages from 'components/hooks/useMessages';
import { usePathname } from 'next/navigation';

export function UpdateNotice({ user, config }) {
  const { formatMessage, labels, messages } = useMessages();
  const { latest, checked, hasUpdate, releaseUrl } = useStore();
  const pathname = usePathname();
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
    <div className={styles.notice}>
      <div className={styles.message}>
        {formatMessage(messages.newVersionAvailable, { version: `v${latest}` })}
      </div>
      <div className={styles.buttons}>
        <Button variant="primary" onClick={handleViewClick}>
          {formatMessage(labels.viewDetails)}
        </Button>
        <Button onClick={handleDismissClick}>{formatMessage(labels.dismiss)}</Button>
      </div>
    </div>,
    document.body,
  );
}

export default UpdateNotice;
