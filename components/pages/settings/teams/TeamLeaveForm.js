import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export function TeamLeaveForm({ teamId, userId, teamName, onSave, onClose }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(() => del(`/team/${teamId}/users/${userId}`));

  const handleSubmit = async () => {
    mutate(
      {},
      {
        onSuccess: async () => {
          onSave();
          onClose();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>
        <FormattedMessage {...messages.confirmLeave} values={{ name: <b>{teamName}</b> }} />
      </p>
      <FormButtons flex>
        <SubmitButton variant="danger" disabled={isLoading}>
          {formatMessage(labels.leave)}
        </SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default TeamLeaveForm;
