import useApi from 'hooks/useApi';
import {
  Button,
  Form,
  FormRow,
  FormButtons,
  FormInput,
  SubmitButton,
  TextField,
} from 'react-basics';

const CONFIRM_VALUE = 'RESET';

export default function WebsiteResetForm({ websiteId, onSave, onClose }) {
  const { post, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data =>
    post(`/websites/${websiteId}/reset`, data),
  );

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <div>
        To reset this website, type <b>{CONFIRM_VALUE}</b> in the box below to confirm.
      </div>
      <FormRow label="Confirmation">
        <FormInput name="confirm" rules={{ validate: value => value === CONFIRM_VALUE }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={isLoading}>
          Save
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
