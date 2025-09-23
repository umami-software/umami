import {
  Form,
  FormField,
  FormSubmitButton,
  Row,
  TextField,
  Button,
  Label,
  Column,
  Icon,
  Loading,
} from '@umami/react-zen';
import { useConfig, usePixelQuery } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { RefreshCw } from '@/components/icons';
import { getRandomChars } from '@/lib/generate';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { useEffect, useState } from 'react';
import { PIXELS_URL } from '@/lib/constants';

const generateId = () => getRandomChars(9);

export function PixelEditForm({
  pixelId,
  teamId,
  onSave,
  onClose,
}: {
  pixelId?: string;
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    pixelId ? `/pixels/${pixelId}` : '/pixels',
    {
      id: pixelId,
      teamId,
    },
  );
  const { pixelsUrl } = useConfig();
  const hostUrl = pixelsUrl || PIXELS_URL;
  const { data, isLoading } = usePixelQuery(pixelId);
  const [slug, setSlug] = useState(generateId());

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('pixels');
        onSave?.();
        onClose?.();
      },
    });
  };

  const handleSlug = () => {
    const slug = generateId();

    setSlug(slug);

    return slug;
  };

  useEffect(() => {
    if (data) {
      setSlug(data.slug);
    }
  }, [data]);

  if (pixelId && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={{ slug, ...data }}>
      {({ setValue }) => {
        return (
          <>
            <FormField
              label={formatMessage(labels.name)}
              name="name"
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoComplete="off" />
            </FormField>

            <FormField
              name="slug"
              rules={{
                required: formatMessage(labels.required),
              }}
              style={{ display: 'none' }}
            >
              <input type="hidden" />
            </FormField>

            <Column>
              <Label>{formatMessage(labels.link)}</Label>
              <Row alignItems="center" gap>
                <TextField
                  value={`${hostUrl}/${slug}`}
                  autoComplete="off"
                  isReadOnly
                  allowCopy
                  style={{ width: '100%' }}
                />
                <Button onPress={() => setValue('slug', handleSlug(), { shouldDirty: true })}>
                  <Icon>
                    <RefreshCw />
                  </Icon>
                </Button>
              </Row>
            </Column>

            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {formatMessage(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton isDisabled={false}>{formatMessage(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
