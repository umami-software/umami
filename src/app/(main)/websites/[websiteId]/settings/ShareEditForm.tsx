import {
  Button,
  Column,
  Form,
  FormSubmitButton,
  Label,
  Loading,
  Row,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useApi, useConfig, useMessages, useModified } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';

export function ShareEditForm({
  shareId,
  onSave,
  onClose,
}: {
  shareId: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/share/id/${shareId}`);
  const { cloudMode } = useConfig();
  const { get } = useApi();
  const { modified } = useModified('shares');
  const [share, setShare] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUrl = (slug: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${slug}`;
    }
    return `${window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
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
  }, [shareId, modified]);

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      { slug: data.slug, parameters: share?.parameters || {} },
      {
        onSuccess: async () => {
          toast(formatMessage(messages.saved));
          touch('shares');
          onSave?.();
          onClose?.();
        },
      },
    );
  };

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  const url = getUrl(share?.slug || '');

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ slug: share?.slug }}
    >
      <Column gap>
        <Column>
          <Label>{formatMessage(labels.shareUrl)}</Label>
          <TextField value={url} isReadOnly allowCopy />
        </Column>
        <Row justifyContent="flex-end" paddingTop="3" gap="3">
          {onClose && (
            <Button isDisabled={isPending} onPress={onClose}>
              {formatMessage(labels.cancel)}
            </Button>
          )}
          <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
        </Row>
      </Column>
    </Form>
  );
}
