import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export function TeamDeleteForm({ teamId, teamName, onSave, onClose }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/teams/${teamId}`, data));

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
        <FormattedMessage {...messages.confirmDelete} values={{ target: <b>{teamName}</b> }} />
      </p>
      <FormButtons flex>
        <SubmitButton variant="danger" disabled={isLoading}>
          {formatMessage(labels.delete)}
        </SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default TeamDeleteForm;
