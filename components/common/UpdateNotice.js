import { useState, useEffect, useCallback } from 'react';
import { Button, Row, Column } from 'react-basics';
import { setItem } from 'next-basics';
import useStore, { checkVersion } from 'store/version';
import { REPO_URL, VERSION_CHECK } from 'lib/constants';
import styles from './UpdateNotice.module.css';
import useMessages from 'hooks/useMessages';

export function UpdateNotice() {
  const { formatMessage, labels, messages } = useMessages();
  const { latest, checked, hasUpdate, releaseUrl } = useStore();
  const [dismissed, setDismissed] = useState(false);

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
    if (!checked) {
      checkVersion();
    }
  }, [checked]);

  if (!hasUpdate || dismissed) {
    return null;
  }

  return (
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
    </Row>
  );
}

export default UpdateNotice;
