import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { Button, Form, FormButtons, FormInput, SubmitButton, TextField } from 'react-basics';
import styles from './Form.module.css';

const CONFIRM_VALUE = 'DELETE';

export default function WebsiteDeleteForm({ websiteId, onSave, onClose }) {
  const { del } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/websites/${websiteId}`, data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit} error={error}>
      <div>
        To delete this website, type <b>{CONFIRM_VALUE}</b> in the box below to confirm.
      </div>
      <FormInput
        name="confirmation"
        label="Confirm"
        rules={{ validate: value => value === CONFIRM_VALUE }}
      >
        <TextField autoComplete="off" />
      </FormInput>
      <FormButtons flex>
        <SubmitButton variant="primary" className={styles.button} disabled={isLoading}>
          Save
        </SubmitButton>
        <Button className={styles.button} disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
