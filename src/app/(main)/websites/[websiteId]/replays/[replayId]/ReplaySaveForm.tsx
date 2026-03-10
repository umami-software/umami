'use client';
import {
  Button,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  TextField,
} from '@umami/react-zen';
import { useMessages, useUpdateQuery } from '@/components/hooks';
import { touch } from '@/components/hooks/useModified';

export function ReplaySaveForm({
  websiteId,
  replayId,
  onSave,
  onClose,
}: {
  websiteId: string;
  replayId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending } = useUpdateQuery(
    `/websites/${websiteId}/replays/saved/${replayId}`,
  );

  const handleSubmit = async (formData: { name: string }) => {
    await mutateAsync(
      { isSaved: true, name: formData.name },
      {
        onSuccess: () => {
          touch('replays');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)}>
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField autoFocus />
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
