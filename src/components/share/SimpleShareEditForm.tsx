import {
  Button,
  Column,
  DialogFooter,
  Field,
  FieldLabel,
  Form,
  FormField,
  FormSubmitButton,
  Loading,
  Row,
  Switch,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useApi, useConfig, useMessages, useModified } from '@/components/hooks';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';

export function SimpleShareEditForm({
  shareId,
  onSave,
  onClose,
}: {
  shareId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, getErrorMessage } = useMessages();
  const config = useConfig();
  const { get, post } = useApi();
  const { touch } = useModified();
  const { modified } = useModified('shares');
  const [share, setShare] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<any>(null);

  const getUrl = (slug: string) => {
    return `${config?.cloudMode ? process.env.cloudUrl : window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
  };

  useEffect(() => {
    const loadShare = async () => {
      setIsLoading(true);
      try {
        const data = await get(`/share/id/${shareId}`);
        setShare(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadShare();
  }, [get, modified, shareId]);

  const handleSubmit = async (data: { name: string; allowFilter?: boolean; theme?: string }) => {
    setIsPending(true);
    setError(null);

    try {
      await post(`/share/id/${shareId}`, {
        name: data.name,
        slug: share.slug,
        parameters: {
          ...(share.parameters || {}),
          allowFilter: data.allowFilter ?? true,
          theme: data.theme === 'system' ? undefined : data.theme,
        },
      });

      touch('shares');
      onSave?.();
      onClose?.();
    } catch (e) {
      setError(e);
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{
        name: share?.name || '',
        allowFilter: share?.parameters?.allowFilter ?? true,
        theme: share?.parameters?.theme || 'system',
      }}
    >
      {({ watch, setValue }) => (
        <Column gap="6">
          <TextField
            label={t(labels.shareUrl)}
            value={getUrl(share?.slug || '')}
            readOnly
            allowCopy
          />
          <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
            <TextField autoComplete="off" autoFocus />
          </FormField>
          <Row gap="6">
            <FormField label={t(labels.filters)} name="allowFilter">
              {({ controlProps }) => (
                <Field orientation="horizontal">
                  <Switch
                    {...controlProps}
                    checked={watch('allowFilter')}
                    onCheckedChange={value => setValue('allowFilter', value, { shouldDirty: true })}
                  />
                  <FieldLabel htmlFor={controlProps.id}>{t(labels.filtersEnabled)}</FieldLabel>
                </Field>
              )}
            </FormField>
            <FormField label={t(labels.theme)} name="theme">
              <ThemeModeSelector
                value={watch('theme')}
                includeSystem
                onChange={value => setValue('theme', value, { shouldDirty: true })}
              />
            </FormField>
          </Row>
          <DialogFooter>
            {onClose && (
              <Button variant="outline" disabled={isPending} onClick={onClose}>
                {t(labels.cancel)}
              </Button>
            )}
            <FormSubmitButton disabled={isPending}>{t(labels.save)}</FormSubmitButton>
          </DialogFooter>
        </Column>
      )}
    </Form>
  );
}
