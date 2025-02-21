import { useApi, useMessages } from '@/components/hooks';
import {
  Button,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  SubmitButton,
  TextField,
} from 'react-basics';

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
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={isPending}>
          {formatMessage(labels.save)}
        </SubmitButton>
        <Button disabled={isPending} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}

export default TeamAddForm;
