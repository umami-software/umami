import {
  Form,
  FormField,
  TextField,
  Select,
  FormButtons,
  FormSubmitButton,
  Button,
} from '@umami/react-zen';
import { useApi, useMessages } from '@/components/hooks';

export function GoalAddForm({ onSave, onClose }: { onSave?: () => void; onClose?: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: any) => post('/websites', { ...data }),
  });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  const items = [
    { id: 'page', label: formatMessage(labels.page) },
    { id: 'event', label: formatMessage(labels.event) },
  ];

  return (
    <Form onSubmit={handleSubmit} error={error?.message}>
      <FormField
        name="name"
        label={formatMessage(labels.name)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <FormField
        name="type"
        label={formatMessage(labels.type)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <Select items={items} defaultValue="page" />
      </FormField>
      <FormField
        name="value"
        label={formatMessage(labels.value)}
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField />
      </FormField>
      <FormButtons>
        <Button onPress={onClose} isDisabled={isPending}>
          {formatMessage(labels.cancel)}
        </Button>
        <FormSubmitButton isDisabled={false}>{formatMessage(labels.add)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
