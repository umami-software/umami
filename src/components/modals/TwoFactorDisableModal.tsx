'use client';
import { Button, Column, Dialog, Modal, Row, Text } from '@umami/react-zen';
import { Form, FormButtons, FormField, FormSubmitButton, PasswordField } from '@umami/react-zen';
import { useState } from 'react';
import { OtpInput } from '@/components/common/OtpInput';
import { useMessages, useUpdateQuery } from '@/components/hooks';

interface TwoFactorDisableModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorDisableModal({ onClose, onSuccess }: TwoFactorDisableModalProps) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const [otpValue, setOtpValue] = useState('');
  const { mutateAsync: disable, error, isPending, reset } = useUpdateQuery('/2fa/disable');

  const handleSubmit = async (data: any) => {
    await disable({ password: data.password, token: otpValue }, { onSuccess }).catch(() => {});
  };

  const resetError = () => {
    if (error) reset();
  };

  return (
    <Modal isOpen={true} onOpenChange={onClose}>
      <Dialog title={t(labels.twoFactorDisableTitle)} style={{ width: 420 }}>
        {({ close }) => (
          <Column gap="4">
            <Text>{t(messages.twoFactorDisableDescription)}</Text>
            <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
              <FormField label={t(labels.password)} name="password">
                <PasswordField autoComplete="current-password" onChange={resetError} />
              </FormField>
              <Column gap="1">
                <Text size="sm">{t(labels.twoFactorEnterCode)}</Text>
                <OtpInput
                  value={otpValue}
                  onChange={val => {
                    setOtpValue(val);
                    resetError();
                  }}
                  disabled={isPending}
                />
              </Column>
              <FormButtons>
                <Button variant="outline" onPress={close} isDisabled={isPending}>
                  {t(labels.cancel)}
                </Button>
                <FormSubmitButton
                  variant="danger"
                  isDisabled={isPending || otpValue.length !== 6 || !!error}
                >
                  {t(labels.twoFactorDisable)}
                </FormSubmitButton>
              </FormButtons>
            </Form>
          </Column>
        )}
      </Dialog>
    </Modal>
  );
}
