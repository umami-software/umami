import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'react-basics';
import { setItem } from '@/lib/storage';
import useStore, { checkVersion } from '@/store/version';
import { REPO_URL, VERSION_CHECK } from '@/lib/constants';
import { useMessages } from '@/components/hooks';
import { usePathname } from 'next/navigation';
import styles from './UpdateNotice.module.css';

export function UpdateNotice({ user, config }) {
  const { formatMessage, labels, messages } = useMessages();
  const { latest, checked, hasUpdate, releaseUrl } = useStore();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(checked);

  const allowUpdate =
    process.env.NODE_ENV === 'production' &&
    user?.isAdmin &&
    !config?.updatesDisabled &&
    !config?.privateMode &&
    !pathname.includes('/share/') &&
    !process.env.cloudMode &&
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
