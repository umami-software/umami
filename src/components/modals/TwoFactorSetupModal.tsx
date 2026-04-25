'use client';
import {
  AlertBanner,
  Box,
  Button,
  Code,
  Column,
  Dialog,
  Icon,
  Image,
  Modal,
  Row,
  Tag,
  TagGroup,
  Text,
} from '@umami/react-zen';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { OtpInput } from '@/components/common/OtpInput';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { TwoFactorSuccessModal } from './TwoFactorSuccessModal';
import styles from './TwoFactorSetupModal.module.css';
import { LucideCopy } from 'lucide-react';

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
            <Tag variant="primary">{tag}</Tag>
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
  const { t, labels, messages } = useMessages();
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
        onError: () => setError(t(messages.error)),
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
      setError(err.message || t(messages.error));
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

  const preventDismiss = required ? () => {} : undefined;

  return (
    <Modal isOpen={true} onOpenChange={preventDismiss}>
      <Dialog title={t(labels.twoFactorSetupTitle)} className={styles.twoFactorSetupModal}>
        {({ close }) => (
          <Column gap="9">
            <Text>
              {required && t(messages.twoFactorSetupRequiredDescription) + ' '}
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
                        <Button variant="outline" onPress={handleCopy}>
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
                  disabled={isConfirming}
                />
              </Column>
            </Step>

            {error && <AlertBanner variant="error" title={t(messages.error)} description={error} />}

            <Row gap="2" justifyContent="flex-end">
              {!required && (
                <Button variant="outline" onPress={handleCancel} isDisabled={isConfirming}>
                  {t(labels.cancel)}
                </Button>
              )}
              <Button
                variant="primary"
                onPress={() => handleConfirm()}
                isDisabled={otpValue.length !== 6 || isConfirming || !!error}
              >
                {t(labels.confirm)}
              </Button>
            </Row>
          </Column>
        )}
      </Dialog>
    </Modal>
  );
}
