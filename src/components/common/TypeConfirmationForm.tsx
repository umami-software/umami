import {
  Button,
  Form,
  FormButtons,
  FormField,
  TextField,
  FormSubmitButton,
} from '@umami/react-zen';
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
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger' | 'none';
  isLoading?: boolean;
  error?: string | Error;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();

  if (!confirmationValue) {
    return null;
  }

  return (
    <Form onSubmit={onConfirm} error={error}>
      <p>
        {formatMessage(messages.actionConfirmation, {
          confirmation: <b key="value">{confirmationValue}</b>,
        })}
      </p>
      <FormField
        label={formatMessage(labels.confirm)}
        name="confirm"
        rules={{ validate: value => value === confirmationValue }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton isLoading={isLoading} variant={buttonVariant}>
          {buttonLabel || formatMessage(labels.ok)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
