import { useApi, useMessages } from '@/components/hooks';
import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';

export function TeamAddForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/teams', data),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormField name="name" label={formatMessage(labels.name)}>
        <TextField autoComplete="off" />
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
