import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import { DOMAIN_REGEX } from 'lib/constants';
import { labels } from 'components/messages';

const messages = defineMessages({
  invalidDomain: { id: 'label.invalid-domain', defaultMessage: 'Invalid domain' },
});

export default function WebsiteAddForm({ onSave, onClose }) {
  const { formatMessage } = useIntl();
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/websites', data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <FormRow label="Name">
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormRow label="Domain">
        <FormInput
          name="domain"
          rules={{
            required: formatMessage(labels.required),
            pattern: { value: DOMAIN_REGEX, message: formatMessage(messages.invalidDomain) },
          }}
        >
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={false}>
          {formatMessage(labels.save)}
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          {formatMessage(labels.cancel)}
        </Button>
      </FormButtons>
    </Form>
  );
}
