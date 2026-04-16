import { Button, Column, Form, FormField, FormSubmitButton, Row, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';

export function BoardShareCreateForm({
  boardId,
  onSave,
  onCancel,
}: {
  boardId: string;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const { post } = useApi();
  const { touch } = useModified();
  const { t, labels, getErrorMessage } = useMessages();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const handleSubmit = async (data: { name: string }) => {
    setIsPending(true);
    setError(null);

    try {
      await post(`/boards/${boardId}/shares`, {
        name: data.name,
      });

      touch('shares');
      onSave?.();
    } catch (e) {
      setError(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ name: '' }}>
      <Column gap="4">
        <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
          <TextField autoComplete="off" autoFocus />
        </FormField>
        <Row justifyContent="flex-end" gap="3">
          {onCancel && (
            <Button isDisabled={isPending} onPress={onCancel}>
              {t(labels.cancel)}
            </Button>
          )}
          <FormSubmitButton variant="primary" isDisabled={isPending}>
            {t(labels.add)}
          </FormSubmitButton>
        </Row>
      </Column>
    </Form>
  );
}
