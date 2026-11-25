import {
  Button,
  DialogFooter,
  Form,
  FormField,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';
import type { ComponentProps } from 'react';
import { useMessages } from '@/components/hooks';

export function TypeConfirmationForm({
  confirmationValue,
  buttonLabel,
  buttonVariant,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  confirmationValue: string;
  buttonLabel?: string;
  buttonVariant?: ComponentProps<typeof Button>['variant'];
  isLoading?: boolean;
  error?: string | Error;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  if (!confirmationValue) {
    return null;
  }

  return (
    <Form onSubmit={onConfirm} error={getErrorMessage(error)}>
      <p>
        {t(messages.actionConfirmation, {
          confirmation: confirmationValue,
        })}
      </p>
      <FormField
        label={t(labels.confirm)}
        name="confirm"
        rules={{ validate: value => value === confirmationValue }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton loading={isLoading} variant={buttonVariant}>
          {buttonLabel || t(labels.ok)}
        </FormSubmitButton>
      </DialogFooter>
    </Form>
  );
}
