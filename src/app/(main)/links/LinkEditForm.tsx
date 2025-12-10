import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  Icon,
  Label,
  Loading,
  Row,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useConfig, useLinkQuery, useMessages } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { RefreshCw } from '@/components/icons';
import { LINKS_URL } from '@/lib/constants';
import { getRandomChars } from '@/lib/generate';
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
  const { formatMessage, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    linkId ? `/links/${linkId}` : '/links',
    {
      id: linkId,
      teamId,
    },
  );
  const { linksUrl } = useConfig();
  const hostUrl = linksUrl || LINKS_URL;
  const { data, isLoading } = useLinkQuery(linkId);
  const [defaultSlug] = useState(generateId());

  const handleSubmit = async (data: any) => {
    await mutateAsync(data, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('links');
        onSave?.();
        onClose?.();
      },
    });
  };

  const checkUrl = (url: string) => {
    if (!isValidUrl(url)) {
      return formatMessage(labels.invalidUrl);
    }
    return true;
  };

  if (linkId && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ slug: defaultSlug, ...data }}
    >
      {({ setValue, watch }) => {
        const slug = watch('slug');

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

            <Grid columns="1fr auto" alignItems="end" gap>
              <FormField
                name="slug"
                label={formatMessage({ id: 'label.slug', defaultMessage: 'Slug' })}
                rules={{
                  required: formatMessage(labels.required),
                }}
              >
                <TextField autoComplete="off" />
              </FormField>
              <Button
                variant="quiet"
                onPress={() => setValue('slug', generateId(), { shouldDirty: true })}
              >
                <Icon>
                  <RefreshCw />
                </Icon>
              </Button>
            </Grid>

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
              </Row>
            </Column>

            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {formatMessage(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton>{formatMessage(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
