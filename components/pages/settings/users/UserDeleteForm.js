import { useMutation } from '@tanstack/react-query';
import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export default function UserDeleteForm({ userId, username, onSave, onClose }) {
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
        <FormattedMessage
          {...messages.deleteUserWarning}
          values={{ username: <b>{username}</b> }}
        />
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
