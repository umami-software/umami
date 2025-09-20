import {
  Form,
  FormField,
  FormButtons,
  TextField,
  Button,
  FormSubmitButton,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function TeamJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels, getErrorMessage } = useMessages();
  const { mutate, error, isPending, touch } = useUpdateQuery('/teams/join');

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
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField
        label={formatMessage(labels.accessCode)}
        name="accessCode"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
        <FormSubmitButton variant="primary" isLoading={isPending} isDisabled={isPending}>
          {formatMessage(labels.join)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
