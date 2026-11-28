'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Code,
  Column,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Image,
  Row,
  Tag,
  TagGroup,
  Text,
} from '@umami/react-zen';
import { LucideCopy } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { OtpInput } from '@/components/common/OtpInput';
import { ScrollableDialogContent } from '@/components/common/ScrollableDialogContent';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import styles from './TwoFactorSetupModal.module.css';
import { TwoFactorSuccessModal } from './TwoFactorSuccessModal';

function Step({
  tag,
  title,
  details,
  children,
}: {
  tag: string;
  title: string;
  details: string;
  children: ReactNode;
}) {
  return (
    <Column gap="5">
      <Column gap="3">
        <Row gap="3" alignItems="center">
          <TagGroup>
            <Tag variant="default">{tag}</Tag>
          </TagGroup>
          <Text weight="bold">{title}</Text>
        </Row>
        <Text>{details}</Text>
      </Column>
      {children}
    </Column>
  );
}

interface TwoFactorSetupModalProps {
  required: boolean;
  onClose?: () => void;
}

export function TwoFactorSetupModal({ required, onClose }: TwoFactorSetupModalProps) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const queryClient = useQueryClient();
  const { mutate: initiate } = useUpdateQuery('/2fa/setup/initiate');
  const { mutateAsync: confirm, isPending: isConfirming } = useUpdateQuery('/2fa/setup/confirm');
  const { mutate: cancel } = useUpdateQuery('/2fa/setup/cancel');

  useEffect(() => {
    initiate(
      {},
      {
        onSuccess: (data: any) => {
          setQrCodeDataUrl(data.qrCodeDataUrl);
          setManualKey(data.manualKey);
        },
        onError: (err: any) => setError(getErrorMessage(err) || t(messages.error)),
      },
    );
  }, []);

  const handleConfirm = async (value?: string) => {
    const token = value ?? otpValue;
    if (token.length !== 6) return;
    setError(null);
    try {
      const data: any = await confirm({ token });
      setBackupCodes(data.backupCodes);
    } catch (err: any) {
      setOtpValue('');
      setError(getErrorMessage(err) || t(messages.error));
    }
  };

  const handleCancel = async () => {
    cancel({});
    onClose?.();
  };

  const handleCopy = () => {
    if (manualKey) {
      navigator.clipboard.writeText(manualKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (backupCodes) {
    return (
      <TwoFactorSuccessModal
        backupCodes={backupCodes}
        onClose={() => {
          queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
          onClose?.();
        }}
      />
    );
  }

  return (
    <Dialog open={true}>
      <ScrollableDialogContent
        className={styles.twoFactorSetupModal}
        style={{
          maxWidth: 'calc(100% - 2rem)',
          maxHeight: 'calc(100dvh - 2rem)',
        }}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{t(labels.twoFactorSetupTitle)}</DialogTitle>
        </DialogHeader>
        <Column gap="9">
          <Text>
            {required && `${t(messages.twoFactorSetupRequiredDescription)} `}
            {t(messages.twoFactorSetupDescription)}
          </Text>

          {/* Step 1 - Scan QR Code */}
          <Step
            tag={t(labels.twoFactorStep1)}
            title={t(labels.twoFactorScanQr)}
            details={t(messages.twoFactorStep1Description)}
          >
            <Box padding="2" shadow="lg" borderRadius="lg" border width="fit">
              <Row alignItems="center" gap="2">
                {qrCodeDataUrl && (
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR code"
                    className={styles.qrCodeImage}
                    borderRadius="lg"
                  />
                )}
                <Column>
                  <Text weight="bold">{t(labels.twoFactorCantScan)}</Text>
                  <Column gap="2">
                    <Text size="sm">{t(labels.twoFactorManualEntry)}</Text>
                    <Code>{manualKey}</Code>
                    <div>
                      <Button variant="outline" onClick={handleCopy}>
                        <Icon size="sm">
                          <LucideCopy />
                        </Icon>
                        {copied ? t(labels.twoFactorCodeCopied) : t(labels.twoFactorCopyCode)}
                      </Button>
                    </div>
                  </Column>
                </Column>
              </Row>
            </Box>
          </Step>

          {/* Step 2 - Enter Verification Code */}
          <Step
            tag={t(labels.twoFactorStep2)}
            title={t(labels.twoFactorGetCode)}
            details={t(messages.twoFactorStep2Description)}
          >
            <Column gap="3.5">
              <Text size="sm" weight="bold">
                {t(labels.twoFactorEnterCode)}
              </Text>
              <OtpInput
                value={otpValue}
                onChange={val => {
                  setOtpValue(val);
                  if (error) setError(null);
                }}
                onComplete={handleConfirm}
                readOnly={isConfirming}
              />
            </Column>
          </Step>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </Column>
        <DialogFooter>
          {!required && (
            <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
              {t(labels.cancel)}
            </Button>
          )}
          <Button
            onClick={() => handleConfirm()}
            disabled={otpValue.length !== 6 || isConfirming || !!error}
          >
            {t(labels.confirm)}
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
