import { Button, Form, FormField, FormSubmitButton, Row, Text, TextField } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

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
  const [websiteId, setWebsiteId] = useState<string>();

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      { type: 'board', ...data, parameters: { websiteId } },
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
      <Row alignItems="center" gap="3" paddingTop="3">
        <Text>{formatMessage(labels.website)}</Text>
        <WebsiteSelect websiteId={websiteId} teamId={teamId} onChange={setWebsiteId} />
      </Row>
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
