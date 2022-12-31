import { useMutation } from '@tanstack/react-query';
import useApi from 'hooks/useApi';
import { Button, Form, FormButtons, FormInput, SubmitButton, TextField } from 'react-basics';
import styles from './Form.module.css';

const CONFIRM_VALUE = 'RESET';

export default function WebsiteResetForm({ websiteId, onSave, onClose }) {
  const { post } = useApi();
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
    <Form className={styles.form} onSubmit={handleSubmit} error={error}>
      <div>
        To reset this website, type <b>{CONFIRM_VALUE}</b> in the box below to confirm.
      </div>
      <FormInput
        name="confirm"
        label="Confirmation"
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
