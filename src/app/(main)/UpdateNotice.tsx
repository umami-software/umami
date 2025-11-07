import { useEffect, useCallback, useState } from 'react';
import { Button, AlertBanner, Column, Row } from '@umami/react-zen';
import { setItem } from '@/lib/storage';
import { useVersion, checkVersion } from '@/store/version';
import { REPO_URL, VERSION_CHECK } from '@/lib/constants';
import { useMessages } from '@/components/hooks';
import { usePathname } from 'next/navigation';

export function UpdateNotice({ user, config }) {
  const { formatMessage, labels, messages } = useMessages();
  const { latest, checked, hasUpdate, releaseUrl } = useVersion();
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

  return (
    <Column justifyContent="center" alignItems="center" position="fixed" top="10px" width="100%">
      <Row width="600px">
        <AlertBanner title={formatMessage(messages.newVersionAvailable, { version: `v${latest}` })}>
          <Button variant="primary" onPress={handleViewClick}>
            {formatMessage(labels.viewDetails)}
          </Button>
          <Button onPress={handleDismissClick}>{formatMessage(labels.dismiss)}</Button>
        </AlertBanner>
      </Row>
    </Column>
  );
}
