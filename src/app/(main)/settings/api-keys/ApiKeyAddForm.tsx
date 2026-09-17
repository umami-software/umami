import {
  Alert,
  AlertTitle,
  Button,
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Icon,
  Row,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { CopyButton } from '@/components/common/CopyButton';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { AlertTriangle } from '@/components/icons';

export function ApiKeyAddForm({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery('/me/api-keys');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async result => {
        setCreatedKey(result.key);
        onSave?.();
      },
    });
  };

  if (createdKey) {
    return (
      <Column gap="4">
        <Alert>
          <Icon>
            <AlertTriangle />
          </Icon>
          <AlertTitle>{t(messages.apiKeyCreated)}</AlertTitle>
        </Alert>
        <Row alignItems="center" gap="2">
          <TextField value={createdKey} isReadOnly style={{ flex: 1, fontFamily: 'monospace' }} />
          <CopyButton value={createdKey} label={t(labels.copy)} />
        </Row>
        <Row justifyContent="flex-end">
          <Button variant="primary" onPress={onClose}>
            {t(labels.close)}
          </Button>
        </Row>
      </Column>
    );
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField name="name" label={t(labels.name)}>
        <TextField autoComplete="off" autoFocus />
      </FormField>
      <FormButtons>
        <Button isDisabled={isPending} onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <FormSubmitButton variant="primary" isDisabled={isPending}>
          {t(labels.save)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
