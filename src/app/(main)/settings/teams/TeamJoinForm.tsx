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
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import { setValue } from 'store/cache';

export function TeamJoinForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { formatMessage, labels, getMessage } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({ mutationFn: (data: any) => post('/teams/join', data) });
  const ref = useRef(null);

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        setValue('teams:members', Date.now());
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
