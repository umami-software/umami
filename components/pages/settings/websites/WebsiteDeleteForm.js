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

const CONFIRM_VALUE = 'DELETE';

export default function WebsiteDeleteForm({ websiteId, onSave, onClose }) {
  const { del, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/websites/${websiteId}`, data));

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
        To delete this website, type <b>{CONFIRM_VALUE}</b> in the box below to confirm.
      </div>
      <FormRow label="Confirm">
        <FormInput name="confirmation" rules={{ validate: value => value === CONFIRM_VALUE }}>
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
