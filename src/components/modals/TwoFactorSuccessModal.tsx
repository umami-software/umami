'use client';
import { Button, Column, Dialog, Modal, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import styles from './TwoFactorSuccessModal.module.css';

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
    <Modal isOpen={true}>
      <Dialog title={t(labels.twoFactorSuccessTitle)} className={styles.dialog}>
        {() => (
          <Column gap="5">
            <Text>{t(messages.twoFactorEnabledDescription)}</Text>

            <Column gap="2">
              <Text weight="bold">{t(labels.twoFactorSaveBackupCodes)}</Text>
              <Text>{t(messages.twoFactorBackupDescription)}</Text>

              <div className={styles.codesGrid}>
                {backupCodes.map((code, i) => (
                  <code key={i} className={styles.code}>
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
