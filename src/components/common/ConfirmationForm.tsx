import { Box, Button, DialogFooter, Form, FormSubmitButton } from '@umami/react-zen';
import type { ComponentProps, ReactNode } from 'react';
import { useMessages } from '@/components/hooks';

export interface ConfirmationFormProps {
  message?: ReactNode;
  buttonLabel?: ReactNode;
  buttonVariant?: ComponentProps<typeof Button>['variant'];
  isLoading?: boolean;
  error?: string | Error;
  onConfirm?: () => void;
  onClose?: () => void;
}

export function ConfirmationForm({
  message,
  buttonLabel,
  buttonVariant,
  isLoading,
  error,
  onConfirm,
  onClose,
}: ConfirmationFormProps) {
  const { t, labels, getErrorMessage } = useMessages();

  return (
    <Form onSubmit={onConfirm} error={getErrorMessage(error)}>
      {message && <Box marginY="4">{message}</Box>}
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton
          data-test="button-confirm"
          loading={isLoading}
          variant={buttonVariant}
          disabled={false}
        >
          {buttonLabel || t(labels.ok)}
        </FormSubmitButton>
      </DialogFooter>
    </Form>
  );
}
