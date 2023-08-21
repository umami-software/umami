import { useMutation } from '@tanstack/react-query';
import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

export function UserDeleteForm({ userId, username, onSave, onClose }) {
  const { formatMessage, FormattedMessage, labels, messages } = useMessages();
  const { del } = useApi();
  const { mutate, error, isLoading } = useMutation(() => del(`/users/${userId}`));

  const handleSubmit = async data => {
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
        <SubmitButton variant="danger" disabled={isLoading}>
          {formatMessage(labels.delete)}
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}

export default UserDeleteForm;
