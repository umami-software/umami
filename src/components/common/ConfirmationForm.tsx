import { ReactNode } from 'react';
import { Box, Button, FormSubmitButton, Form, FormButtons } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface ConfirmationFormProps {
  message: ReactNode;
  buttonLabel?: ReactNode;
  buttonVariant?: 'primary' | 'quiet' | 'danger';
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
  const { formatMessage, labels, getErrorMessage } = useMessages();

  return (
    <Form onSubmit={onConfirm} error={getErrorMessage(error)}>
      <Box marginY="4">{message}</Box>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton
          data-test="button-confirm"
          isLoading={isLoading}
          variant={buttonVariant}
          isDisabled={false}
        >
          {buttonLabel || formatMessage(labels.ok)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
