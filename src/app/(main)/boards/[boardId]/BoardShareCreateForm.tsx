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
import { EmbedSettings } from '@/components/share/EmbedSettings';

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

  const handleSubmit = async (data: {
    name: string;
    allowFilter?: boolean;
    theme?: string;
    embed?: boolean;
    embedOrigins?: string;
  }) => {
    setIsPending(true);
    setError(null);

    try {
      await post(`/boards/${boardId}/shares`, {
        name: data.name,
        parameters: {
          allowFilter: data.allowFilter ?? true,
          theme: data.theme === 'system' ? undefined : data.theme,
          embed: data.embed ? true : undefined,
          embedOrigins: data.embed ? data.embedOrigins : undefined,
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
      defaultValues={{
        name: '',
        allowFilter: true,
        theme: 'system',
        embed: false,
        embedOrigins: '',
      }}
    >
      {({ watch, setValue }) => (
        <Column gap="4">
          <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
            <TextField autoComplete="off" autoFocus />
          </FormField>
          <FormField name="allowFilter">
            <Checkbox>{t(labels.filters)}</Checkbox>
          </FormField>
          <FormField label={t(labels.theme)} name="theme">
            <ThemeModeSelector
              value={watch('theme')}
              includeSystem
              onChange={value => setValue('theme', value, { shouldDirty: true })}
            />
          </FormField>
          <EmbedSettings watch={watch} setValue={setValue} />
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
      )}
    </Form>
  );
}
