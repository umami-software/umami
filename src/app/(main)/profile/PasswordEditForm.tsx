import { Form, FormField, FormButtons, PasswordField, Button } from '@umami/react-zen';
import { useApi, useMessages } from '@/components/hooks';

export function PasswordEditForm({ onSave, onClose }) {
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/me/password', data),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  const samePassword = (value: string, values: { [key: string]: any }) => {
    if (value !== values.newPassword) {
      return formatMessage(messages.noMatchPassword);
    }
    return true;
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
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
          minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: 8 }) },
        }}
      >
        <PasswordField autoComplete="new-password" />
      </FormField>
      <FormField
        name="confirmPassword"
        label={formatMessage(labels.confirmPassword)}
        rules={{
          required: formatMessage(labels.required),
          minLength: { value: 8, message: formatMessage(messages.minPasswordLength, { n: 8 }) },
          validate: samePassword,
        }}
      >
        <PasswordField autoComplete="confirm-password" />
      </FormField>
      <FormButtons>
        <Button type="submit" variant="primary" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </Button>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}
