import {
  Button,
  Checkbox,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Row,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';

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
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (data: { name: string; allowFilter?: boolean; theme?: string }) => {
    setIsPending(true);
    setError(null);

    try {
      await post(`/boards/${boardId}/shares`, {
        name: data.name,
        parameters: {
          allowFilter: data.allowFilter ?? true,
          theme: data.theme === 'system' ? undefined : data.theme,
        },
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
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ name: '', allowFilter: true, theme: 'system' }}
    >
      {({ watch, setValue }) => (
        <Column gap="4">
          <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
            <TextField autoComplete="off" autoFocus />
          </FormField>
          <FormField name="allowFilter" label={t(labels.filters)} orientation="horizontal">
            <Checkbox />
          </FormField>
          <FormField label={t(labels.theme)} name="theme">
            <ThemeModeSelector
              value={watch('theme')}
              includeSystem
              onChange={value => setValue('theme', value, { shouldDirty: true })}
            />
          </FormField>
          <Row justifyContent="flex-end" gap="3">
            {onCancel && (
              <Button variant="outline" disabled={isPending} onClick={onCancel}>
                {t(labels.cancel)}
              </Button>
            )}
            <FormSubmitButton disabled={isPending}>{t(labels.add)}</FormSubmitButton>
          </Row>
        </Column>
      )}
    </Form>
  );
}
