import { useRef } from 'react';
import {
  Form,
  FormRow,
  FormInput,
  FormButtons,
  TextField,
  Button,
  SubmitButton,
} from 'react-basics';
import { setValue } from 'store/cache';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

export function TeamAddForm({ onSave, onClose }) {
  const { formatMessage, labels } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => post('/teams', data));
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        setValue('teams', Date.now());
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error}>
      <FormRow label={formatMessage(labels.name)}>
        <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
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

export default TeamAddForm;
