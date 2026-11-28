'use client';
import {
  Button,
  Column,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Row,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import { ScrollableDialogContent } from '@/components/common/ScrollableDialogContent';
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
    <Dialog open={true}>
      <ScrollableDialogContent
        className={styles.dialog}
        style={{
          maxWidth: 'calc(100% - 2rem)',
          maxHeight: 'calc(100dvh - 2rem)',
        }}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{t(labels.twoFactorSuccessTitle)}</DialogTitle>
        </DialogHeader>
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
              <Button variant="outline" onClick={handleDownload}>
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
        </Column>
        <DialogFooter>
          <Button onClick={onClose} disabled={!saved}>
            {t(labels.close)}
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
