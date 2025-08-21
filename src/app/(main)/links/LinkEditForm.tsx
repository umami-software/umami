import { useState, useEffect } from 'react';
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
import { useConfig, useLinkQuery } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { Refresh } from '@/components/icons';
import { getRandomChars } from '@/lib/crypto';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { LINKS_URL } from '@/lib/constants';
import { isValidUrl } from '@/lib/url';

const generateId = () => getRandomChars(9);

export function LinkEditForm({
  linkId,
  teamId,
  onSave,
  onClose,
}: {
  linkId?: string;
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { mutate, error, isPending, touch, toast } = useUpdateQuery(
    linkId ? `/links/${linkId}` : '/links',
    {
      id: linkId,
      teamId,
    },
  );
  const { linksUrl } = useConfig();
  const hostUrl = linksUrl || LINKS_URL;
  const { data, isLoading } = useLinkQuery(linkId);
  const [slug, setSlug] = useState(generateId());

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('links');
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

  const checkUrl = (url: string) => {
    if (!isValidUrl(url)) {
      return formatMessage(labels.invalidUrl);
    }
    return true;
  };

  useEffect(() => {
    if (data) {
      setSlug(data.slug);
    }
  }, [data]);

  if (linkId && isLoading) {
    return <Loading position="page" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={error?.message} defaultValues={{ slug, ...data }}>
      {({ setValue }) => {
        return (
          <>
            <FormField
              label={formatMessage(labels.name)}
              name="name"
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoComplete="off" autoFocus />
            </FormField>

            <FormField
              label={formatMessage(labels.destinationUrl)}
              name="url"
              rules={{ required: formatMessage(labels.required), validate: checkUrl }}
            >
              <TextField placeholder="https://example.com" autoComplete="off" />
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
                <Button
                  variant="quiet"
                  onPress={() => setValue('slug', handleSlug(), { shouldDirty: true })}
                >
                  <Icon>
                    <Refresh />
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
