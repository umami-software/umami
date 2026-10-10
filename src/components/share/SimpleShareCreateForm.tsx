import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Row,
  Switch,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useApi, useMessages, useModified } from '@/components/hooks';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';

export function SimpleShareCreateForm({
  createPath,
  onSave,
  onCancel,
}: {
  createPath: string;
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
      await post(createPath, {
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
          <Row gap="6">
            <FormField label={t(labels.filters)} name="allowFilter">
              <Switch
                isSelected={watch('allowFilter')}
                onChange={value => setValue('allowFilter', value, { shouldDirty: true })}
              >
                {t(labels.filtersEnabled)}
              </Switch>
            </FormField>
            <FormField label={t(labels.theme)} name="theme">
              <ThemeModeSelector
                value={watch('theme')}
                includeSystem
                onChange={value => setValue('theme', value, { shouldDirty: true })}
              />
            </FormField>
          </Row>
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
