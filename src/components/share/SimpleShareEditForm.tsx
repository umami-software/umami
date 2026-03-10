import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Label,
  Loading,
  Row,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useApi, useConfig, useMessages, useModified } from '@/components/hooks';

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

  const handleSubmit = async (data: { name: string }) => {
    setIsPending(true);
    setError(null);

    try {
      await post(`/share/id/${shareId}`, {
        name: data.name,
        slug: share.slug,
        parameters: share.parameters || {},
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
      defaultValues={{ name: share?.name || '' }}
    >
      <Column gap="6">
        <Column>
          <Label>{t(labels.shareUrl)}</Label>
          <TextField value={getUrl(share?.slug || '')} isReadOnly allowCopy />
        </Column>
        <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
          <TextField autoComplete="off" autoFocus />
        </FormField>
        <Row justifyContent="flex-end" paddingTop="3" gap="3">
          {onClose && (
            <Button isDisabled={isPending} onPress={onClose}>
              {t(labels.cancel)}
            </Button>
          )}
          <FormSubmitButton variant="primary" isDisabled={isPending}>
            {t(labels.save)}
          </FormSubmitButton>
        </Row>
      </Column>
    </Form>
  );
}
