import {
  Form,
  FormField,
  FormButtons,
  PasswordField,
  Button,
  FormSubmitButton,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function PasswordEditForm({ onSave, onClose }) {
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/me/password');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  const samePassword = (value: string, values: Record<string, any>) => {
    if (value !== values.newPassword) {
      return formatMessage(messages.noMatchPassword);
    }
    return true;
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        label={formatMessage(labels.currentPassword)}
        name="currentPassword"
        rules={{ required: 'Required' }}
      >
        <PasswordField autoComplete="current-password" />
      </FormField>
      <FormField
        name="newPassword"
        label={formatMessage(labels.newPassword)}
        rules={{
          required: 'Required',
          minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField autoComplete="new-password" />
      </FormField>
      <FormField
        name="confirmPassword"
        label={formatMessage(labels.confirmPassword)}
        rules={{
          required: formatMessage(labels.required),
          minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: '8' }) },
          validate: samePassword,
        }}
      >
        <PasswordField autoComplete="confirm-password" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton isDisabled={isPending}>{formatMessage(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
