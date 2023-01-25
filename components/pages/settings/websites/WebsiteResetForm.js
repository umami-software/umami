import {
  Button,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  SubmitButton,
  TextField,
} from 'react-basics';
import useApi from 'hooks/useApi';
import { useIntl } from 'react-intl';
import { labels, messages } from 'components/messages';

const CONFIRM_VALUE = 'RESET';

export default function WebsiteResetForm({ websiteId, onSave, onClose }) {
  const { formatMessage } = useIntl();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/websites/${websiteId}/reset`, data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <p>{formatMessage(messages.resetWebsite, { confirmation: CONFIRM_VALUE })}</p>
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
