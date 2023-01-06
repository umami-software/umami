import { useMutation } from '@tanstack/react-query';
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
import styles from './Form.module.css';

const CONFIRM_VALUE = 'DELETE';

export default function UserDeleteForm({ userId, onSave, onClose }) {
  const { del } = useApi();
  const { mutate, error, isLoading } = useMutation(data => del(`/users/${userId}`, data));

  const handleSubmit = async data => {
    mutate(data, {
      onSuccess: async () => {
        onSave();
      },
    });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit} error={error}>
      <p>
        To delete this user, type <b>{CONFIRM_VALUE}</b> in the box below to confirm.
      </p>
      <FormRow label="Confirm">
        <FormInput name="confirmation" rules={{ validate: value => value === CONFIRM_VALUE }}>
          <TextField autoComplete="off" />
        </FormInput>
      </FormRow>
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
