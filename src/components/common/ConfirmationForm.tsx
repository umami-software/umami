import { ReactNode } from 'react';
import { Button, LoadingButton, Form, FormButtons } from 'react-basics';
import { useMessages } from 'components/hooks';

export interface ConfirmationFormProps {
  message: ReactNode;
  buttonLabel?: ReactNode;
  buttonVariant?: 'none' | 'primary' | 'secondary' | 'quiet' | 'danger';
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
  const { formatMessage, labels } = useMessages();

  return (
    <Form error={error}>
      <p>{message}</p>
      <FormButtons flex>
        <LoadingButton isLoading={isLoading} onClick={onConfirm} variant={buttonVariant}>
          {buttonLabel || formatMessage(labels.ok)}
        </LoadingButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default ConfirmationForm;
