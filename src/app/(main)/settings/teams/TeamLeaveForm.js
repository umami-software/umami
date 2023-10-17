import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import { setValue } from 'store/cache';

export function TeamLeaveForm({ teamId, userId, teamName, onSave, onClose }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(() => del(`/teams/${teamId}/users/${userId}`));

  const handleSubmit = async () => {
    mutate(
      {},
      {
        onSuccess: async () => {
          setValue('team:members', Date.now());
          onSave();
          onClose();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{teamName}</b> }} />
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
