'use client';

import { Column, LoadingButton, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { useConfig, useMessages } from '@/components/hooks';
import { CURRENT_VERSION, REPO_URL } from '@/lib/constants';
import { getVersionUpdate } from '@/store/version';

export function VersionSetting() {
  const { updatesDisabled, privateMode } = useConfig();
  const { t, labels, messages } = useMessages();
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getVersionUpdate>>>();

  const handleCheck = async () => {
    setIsChecking(true);
    setResult(undefined);
    setResult(await getVersionUpdate());
    setIsChecking(false);
  };

  if (updatesDisabled || privateMode) {
    return <Text>{CURRENT_VERSION}</Text>;
  }

  let statusMessage = '';

  if (result === null) {
    statusMessage = t(messages.versionCheckFailed);
  } else if (result?.hasUpdate) {
    statusMessage = t(messages.newVersionAvailable, { version: `v${result.latest}` });
  } else if (result) {
    statusMessage = t(messages.versionUpToDate);
  }

  return (
    <Column minWidth="0">
      <Row alignItems="center" justifyContent="end" gap="3" wrap="wrap">
        <Text>{CURRENT_VERSION}</Text>
        <LoadingButton variant="outline" loading={isChecking} onClick={handleCheck}>
          {t(labels.checkForUpdates)}
        </LoadingButton>
      </Row>
      <div role="status">
        {statusMessage && (
          <Row alignItems="center" justifyContent="end" gap="2" marginTop="2" wrap="wrap">
            <Text color="muted">{statusMessage}</Text>
            {result?.hasUpdate && (
              <a
                href={result.releaseUrl || `${REPO_URL}/releases`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {t(labels.viewDetails)}
              </a>
            )}
          </Row>
        )}
      </div>
    </Column>
  );
}
