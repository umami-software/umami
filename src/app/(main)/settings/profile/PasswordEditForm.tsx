import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  PasswordField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function PasswordEditForm({ onSave, onClose }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
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
      return t(messages.noMatchPassword);
    }
    return true;
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        label={t(labels.currentPassword)}
        name="currentPassword"
        rules={{ required: 'Required' }}
      >
        <PasswordField autoComplete="current-password" />
      </FormField>
      <FormField
        name="newPassword"
        label={t(labels.newPassword)}
        rules={{
          required: 'Required',
          minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
        }}
      >
        <PasswordField autoComplete="new-password" />
      </FormField>
      <FormField
        name="confirmPassword"
        label={t(labels.confirmPassword)}
        rules={{
          required: t(labels.required),
          minLength: { value: 8, message: t(messages.minPasswordLength, { n: '8' }) },
          validate: samePassword,
        }}
      >
        <PasswordField autoComplete="confirm-password" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        <FormSubmitButton isDisabled={isPending}>{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
