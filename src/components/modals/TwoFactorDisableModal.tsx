'use client';
import {
  Button,
  Column,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  PasswordField,
  Text,
} from '@umami/react-zen';
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
    <Dialog open={true} onOpenChange={open => !open && onClose()}>
      <DialogContent style={{ width: 420 }}>
        <DialogHeader>
          <DialogTitle>{t(labels.twoFactorDisableTitle)}</DialogTitle>
        </DialogHeader>
        <Column gap="4">
          <Text>{t(messages.twoFactorDisableDescription)}</Text>
          <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
            <FormField label={t(labels.password)} name="password">
              <PasswordField autoComplete="current-password" onValueChange={resetError} />
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
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                {t(labels.cancel)}
              </Button>
              <FormSubmitButton
                variant="destructive"
                disabled={isPending || otpValue.length !== 6 || !!error}
              >
                {t(labels.twoFactorDisable)}
              </FormSubmitButton>
            </FormButtons>
          </Form>
        </Column>
      </DialogContent>
    </Dialog>
  );
}
