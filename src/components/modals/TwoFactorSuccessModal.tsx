'use client';
import { Button, Column, Dialog, Modal, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';

interface TwoFactorSuccessModalProps {
  backupCodes: string[];
  onClose: () => void;
}

export function TwoFactorSuccessModal({ backupCodes, onClose }: TwoFactorSuccessModalProps) {
  const { t, labels, messages } = useMessages();
  const [saved, setSaved] = useState(false);

  const handleDownload = () => {
    const content = [
      t(labels.twoFactorBackupFileTitle),
      t(messages.twoFactorBackupCodesOnce),
      '',
      ...backupCodes,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'umami-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={true} onOpenChange={() => {}}>
      <Dialog title={t(labels.twoFactorSuccessTitle)} style={{ width: 480, maxWidth: '95vw' }}>
        {() => (
          <Column gap="5">
            <Text>{t(messages.twoFactorEnabledDescription)}</Text>

            <Column gap="2">
              <Text weight="bold">{t(labels.twoFactorSaveBackupCodes)}</Text>
              <Text>{t(messages.twoFactorBackupDescription)}</Text>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--surface-sunken)',
                  borderRadius: 8,
                }}
              >
                {backupCodes.map((code, i) => (
                  <code key={i} style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {code}
                  </code>
                ))}
              </div>

              <Row>
                <Button variant="outline" onPress={handleDownload}>
                  {t(labels.twoFactorDownloadCodes)}
                </Button>
              </Row>
            </Column>

            <Row gap="2" alignItems="center">
              <input
                type="checkbox"
                id="saved-codes"
                checked={saved}
                onChange={e => setSaved(e.target.checked)}
              />
              <label htmlFor="saved-codes">
                <Text>{t(labels.twoFactorSavedCodes)}</Text>
              </label>
            </Row>

            <Row justifyContent="flex-end">
              <Button variant="primary" onPress={onClose} isDisabled={!saved}>
                {t(labels.close)}
              </Button>
            </Row>
          </Column>
        )}
      </Dialog>
    </Modal>
  );
}
