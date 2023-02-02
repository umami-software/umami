import {
  Button,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  SubmitButton,
  TextField,
} from 'react-basics';
import { useIntl } from 'react-intl';
import { labels, messages } from 'components/messages';
import useApi from 'hooks/useApi';

const CONFIRM_VALUE = 'DELETE';

export default function WebsiteDeleteForm({ websiteId, onSave, onClose }) {
  const { formatMessage } = useIntl();
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
      <p>{formatMessage(messages.deleteWebsite, { confirmation: CONFIRM_VALUE })}</p>
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
