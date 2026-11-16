import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  Icon,
  Label,
  ListItem,
  Loading,
  Row,
  Select,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useConfig, useLinkQuery, useMessages, useSlug } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { RefreshCw } from '@/components/icons';
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
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    linkId ? `/links/${linkId}` : '/links',
    {
      id: linkId,
      teamId,
    },
  );
  const config = useConfig();
  const cloudMode = config?.cloudMode;
  const { getHostUrl, hostUrls } = useSlug('link');
  const hasBaseUrls = hostUrls.length > 1;
  const { data, isLoading } = useLinkQuery(linkId);
  const [defaultSlug] = useState(generateId());

  const handleSubmit = async ({ baseUrl, ...values }: any) => {
    // Only send a base url the user changed, so a link left on the default keeps following it.
    const changed = baseUrl !== getHostUrl(data?.baseUrl);

    await mutateAsync(changed ? { ...values, baseUrl } : values, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('links');
        touch(`link:${linkId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  const checkUrl = (url: string, formValues: any) => {
    // Every base url reaches the same slug, so a link to any of them would redirect to itself.
    if (!isValidUrl(url) || hostUrls.some(hostUrl => url === `${hostUrl}/${formValues.slug}`)) {
      return t(labels.invalidUrl);
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
      defaultValues={{ slug: defaultSlug, ...data, baseUrl: getHostUrl(data?.baseUrl) }}
    >
      {({ setValue, watch }) => {
        const slug = watch('slug');
        const baseUrl = watch('baseUrl');

        return (
          <>
            <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus />
            </FormField>

            <FormField
              label={t(labels.destinationUrl)}
              name="url"
              rules={{ required: t(labels.required), validate: checkUrl }}
            >
              <TextField placeholder="https://example.com" autoComplete="off" />
            </FormField>

            {hasBaseUrls && (
              <FormField label={t(labels.domain)} name="baseUrl">
                <Select>
                  {hostUrls.map(hostUrl => (
                    <ListItem key={hostUrl} id={hostUrl}>
                      {hostUrl}
                    </ListItem>
                  ))}
                </Select>
              </FormField>
            )}

            {cloudMode ? (
              <FormField
                name="slug"
                rules={{
                  required: t(labels.required),
                }}
                style={{ display: 'none' }}
              >
                <input type="hidden" />
              </FormField>
            ) : (
              <Grid columns="1fr auto" alignItems="end" gap>
                <FormField
                  name="slug"
                  label={t(labels.slug)}
                  rules={{
                    required: t(labels.required),
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
            )}

            <Column gap="1">
              <Label>{t(labels.link)}</Label>
              <Row alignItems="center" gap>
                <TextField
                  value={`${getHostUrl(baseUrl)}/${slug}`}
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
                  {t(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton>{t(labels.save)}</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
