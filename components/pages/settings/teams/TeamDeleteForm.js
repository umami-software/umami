import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import { useIntl, FormattedMessage } from 'react-intl';
import { labels, messages } from 'components/messages';
import useApi from 'hooks/useApi';

export default function TeamDeleteForm({ teamId, teamName, onSave, onClose }) {
  const { formatMessage } = useIntl();
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
        <FormattedMessage {...messages.deleteTeamWarning} values={{ name: <b>{teamName}</b> }} />
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
