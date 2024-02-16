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
import { useApi, useMessages, useModified } from 'components/hooks';

export function TeamJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels, getMessage } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({ mutationFn: (data: any) => post('/teams/join', data) });
  const ref = useRef(null);
  const { touch } = useModified();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        touch('teams:members');
        onSave?.();
        onClose?.();
      },
    });
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error && getMessage(error)}>
      <FormRow label={formatMessage(labels.accessCode)}>
        <FormInput name="accessCode" rules={{ required: formatMessage(labels.required) }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary">{formatMessage(labels.join)}</SubmitButton>
        <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
      </FormButtons>
    </Form>
  );
}

export default TeamJoinForm;
