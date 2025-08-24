import {
  Form,
  FormField,
  FormButtons,
  TextField,
  Button,
  FormSubmitButton,
} from '@umami/react-zen';
import { useMessages, useModified, useUpdateQuery } from '@/components/hooks';

export function TeamJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { mutate, error } = useUpdateQuery('/teams/join');
  const { touch } = useModified();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        touch('teams:members');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormField
        label={formatMessage(labels.accessCode)}
        name="accessCode"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton variant="primary">{formatMessage(labels.join)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
