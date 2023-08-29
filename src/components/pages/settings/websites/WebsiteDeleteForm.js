import {
  Button,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  SubmitButton,
  TextField,
} from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

const CONFIRM_VALUE = 'DELETE';

export function WebsiteDeleteForm({ websiteId, onSave, onClose }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { del, useMutation } = useApi();
  const { mutate, error } = useMutation(data => del(`/websites/${websiteId}`, data));

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
          {...messages.deleteWebsite}
          values={{ confirmation: <b>{CONFIRM_VALUE}</b> }}
        />
      </p>
      <FormRow label={formatMessage(labels.confirm)}>
        <FormInput name="confirmation" rules={{ validate: value => value === CONFIRM_VALUE }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="danger">{formatMessage(labels.delete)}</SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default WebsiteDeleteForm;
