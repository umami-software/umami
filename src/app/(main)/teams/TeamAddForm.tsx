import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { UserSelect } from '@/components/input/UserSelect';

export function TeamAddForm({
  onSave,
  onClose,
  isAdmin,
}: {
  onSave: () => void;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const { formatMessage, labels, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/teams');

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField name="name" label={formatMessage(labels.name)}>
        <TextField autoComplete="off" />
      </FormField>
      {isAdmin && (
        <FormField name="ownerId" label={formatMessage(labels.teamOwner)}>
          <UserSelect buttonProps={{ style: { outline: 'none' } }} />
        </FormField>
      )}
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
