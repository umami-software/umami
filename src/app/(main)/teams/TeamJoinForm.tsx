import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function TeamJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { t, labels, getErrorMessage } = useMessages();
  const { mutateAsync, error, touch } = useUpdateQuery('/teams/join');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        touch('teams:members');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        label={t(labels.accessCode)}
        name="accessCode"
        rules={{ required: t(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{t(labels.cancel)}</Button>
        <FormSubmitButton variant="primary">{t(labels.join)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
