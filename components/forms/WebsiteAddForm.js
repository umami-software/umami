import { useRef } from 'react';
import { Form, FormInput, FormButtons, TextField, Button, SubmitButton } from 'react-basics';
import useApi from 'hooks/useApi';
import styles from './Form.module.css';
import { useMutation } from '@tanstack/react-query';
import { getClientAuthToken } from 'lib/client';
import { DOMAIN_REGEX } from 'lib/constants';

export default function WebsiteAddForm({ onSave, onClose }) {
  const { post } = useApi(getClientAuthToken());
  const { mutate, error, isLoading } = useMutation(data => post('/websites', data));
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
      <FormInput
        name="domain"
        label="Domain"
        rules={{
          required: 'Required',
          pattern: { value: DOMAIN_REGEX, message: 'Invalid domain' },
        }}
      >
        <TextField autoComplete="off" />
      </FormInput>
      <FormButtons flex>
        <SubmitButton variant="primary" disabled={false}>
          Save
        </SubmitButton>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      </FormButtons>
    </Form>
  );
}
