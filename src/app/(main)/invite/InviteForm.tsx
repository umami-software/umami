'use client';
import { Form, FormRow, FormInput, FormButtons, TextField, Button } from 'react-basics';
import { useApi, useMessages, useModified } from '@/components/hooks';
import styles from './InviteForm.module.css';
import { useSearchParams } from 'next/navigation';

export function InviteForm() {
  const searchParams = useSearchParams();

  const accessCode = searchParams.get('accessCode');
  const { formatMessage, labels } = useMessages();
  const { post, useMutation } = useApi();

  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post('/teams/join', data),
  });

  const { touch } = useModified();

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        touch('teams:members');
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <Form
          onSubmit={handleSubmit}
          error={error}
          values={{
            accessCode: accessCode || '',
          }}
          autoComplete="off"
          preventSubmit={false}
        >
          <FormRow label={formatMessage(labels.accessCode)}>
            <FormInput name="accessCode" rules={{ required: formatMessage(labels.required) }}>
              <TextField autoComplete="off" />
            </FormInput>
          </FormRow>
          <FormButtons flex>
            <Button type="submit" variant="primary">
              {formatMessage(labels.join)}
            </Button>
            <Button onClick={() => {}}>{formatMessage(labels.cancel)}</Button>
          </FormButtons>
        </Form>
      </div>
    </div>
  );
}
