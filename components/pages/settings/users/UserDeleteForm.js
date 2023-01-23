import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { Button, Form, FormButtons, SubmitButton } from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';
import { labels } from 'components/messages';

const messages = defineMessages({
  confirm: { id: 'label.confirm', defaultMessage: 'Confirm' },
  warning: {
    id: 'message.confirm-delete-user',
    defaultMessage: 'Are you sure you want to delete this user?',
  },
});

export default function UserDeleteForm({ userId, onSave, onClose }) {
  const { formatMessage } = useIntl();
  const { del } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/users/${userId}`, data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>{formatMessage(messages.warning)}</p>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={isLoading}>
          {formatMessage(labels.save)}
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}
