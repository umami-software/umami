import { useRef } from 'react';
import { Form, FormInput, FormButtons, TextField, Button } from 'react-basics';
import { useApi } from 'next-basics';
import styles from './Form.module.css';
import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from 'lib/client';

export default function TeamAddForm({ onSave, onClose }) {
  const { post } = useApi(getAuthToken());
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
    <Form ref={ref} className={styles.form} onSubmit={handleSubmit} error={error}>
      <FormInput name="name" label="Name" rules={{ required: 'Required' }}>
        <TextField autoComplete="off" />
      </FormInput>
      <FormButtons flex>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Save
        </Button>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
