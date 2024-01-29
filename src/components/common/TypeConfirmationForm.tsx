import {
  Button,
  Form,
  FormButtons,
  FormRow,
  FormInput,
  TextField,
  SubmitButton,
} from 'react-basics';
import { useMessages } from 'components/hooks';

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
  buttonVariant?: 'none' | 'primary' | 'secondary' | 'quiet' | 'danger';
  isLoading?: boolean;
  error?: string | Error;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();

  if (!confirmationValue) {
    return null;
  }

  return (
    <Form onSubmit={onConfirm} error={error}>
      <p>
        <FormattedMessage
          {...messages.actionConfirmation}
          values={{ confirmation: <b>{confirmationValue}</b> }}
        />
      </p>
      <FormRow label={formatMessage(labels.confirm)}>
        <FormInput name="confirm" rules={{ validate: value => value === confirmationValue }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton isLoading={isLoading} variant={buttonVariant}>
          {buttonLabel || formatMessage(labels.ok)}
        </SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default TypeConfirmationForm;
