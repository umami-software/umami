import { useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import useApi from 'hooks/useApi';
import { labels } from 'components/messages';

export default function TeamAddForm({ onSave, onClose }) {
  const { formatMessage } = useIntl();
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/teams', data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: 'Required' }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
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
