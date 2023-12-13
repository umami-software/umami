import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

export function UserDeleteForm({ userId, username, onSave, onClose }) {
  const { formatMessage, FormattedMessage, labels, messages } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isPending } = useMutation({ mutationFn: () => del(`/users/${userId}`) });

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
        onClose();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{username}</b> }} />
      </p>
      <FormButtons flex>
        <SubmitButton variant="danger" disabled={isPending}>
          {formatMessage(labels.delete)}
        </SubmitButton>
        <Button disabled={isPending} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}

export default UserDeleteForm;
