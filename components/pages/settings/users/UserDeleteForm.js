import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import { useIntl } from 'react-intl';
import { labels, messages } from 'components/messages';

export default function UserDeleteForm({ userId, username, onSave, onClose }) {
  const { formatMessage } = useIntl();
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
      <p>{formatMessage(messages.deleteUserWarning, { username })}</p>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={isLoading}>
          {formatMessage(labels.delete)}
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}
