import { Button, Form, FormField, FormSubmitButton, Row, TextField } from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';

export function BoardAddForm({
  teamId,
  onSave,
  onClose,
}: {
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/boards', { teamId });

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      { type: 'board', ...data },
      {
        onSuccess: async () => {
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={error?.message}>
      <FormField
        label={formatMessage(labels.name)}
        name="name"
        rules={{ required: formatMessage(labels.required) }}
      >
        <TextField autoComplete="off" />
      </FormField>
      <FormField
        label={formatMessage(labels.description)}
        name="description"
        rules={{
          required: formatMessage(labels.required),
        }}
      >
        <TextField asTextArea autoComplete="off" />
      </FormField>
      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {formatMessage(labels.cancel)}
          </Button>
        )}
        <FormSubmitButton data-test="button-submit" isDisabled={false}>
          {formatMessage(labels.save)}
        </FormSubmitButton>
      </Row>
    </Form>
  );
}
