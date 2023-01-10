import useApi from 'hooks/useApi';
import { Button, Form, FormButtons, SubmitButton } from 'react-basics';

export default function ApiKeyDeleteForm({ apiKeyId, onSave, onClose }) {
  const { del, useMutation } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/api-key/${apiKeyId}`, data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit} error={error}>
      <div>Are you sure you want to delete this API KEY?</div>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={isLoading}>
          Delete
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
