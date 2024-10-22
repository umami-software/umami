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

const CONFIRM_VALUE = 'RESET';

export function WebsiteResetForm({ websiteId, onSave, onClose }) {
  const { formatMessage, labels, messages, FormattedMessage } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/websites/${websiteId}/reset`, data));

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
          {...messages.resetWebsite}
          values={{ confirmation: <b>{CONFIRM_VALUE}</b> }}
        />
      </p>
      <FormRow label={formatMessage(labels.confirm)}>
        <FormInput name="confirm" rules={{ validate: value => value === CONFIRM_VALUE }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="danger">{formatMessage(labels.reset)}</SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default WebsiteResetForm;
