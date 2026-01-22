import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Icon,
  Label,
  Loading,
  Row,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useConfig, useLinkQuery, useMessages } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { ChevronDown, ChevronRight, RefreshCw } from '@/components/icons';
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
  const [initialSlug] = useState(() => generateId());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (formData: any) => {
    const { slug: formSlug, ...rest } = formData;
    // Only include slug if creating new link or if it was modified
    const payload = !linkId || formSlug !== data?.slug ? formData : rest;

    await mutateAsync(payload, {
      onSuccess: async () => {
        toast(formatMessage(messages.saved));
        touch('links');
        onSave?.();
        onClose?.();
      },
    });
  };

  const handleSlug = () => generateId();

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
      {...(linkId
        ? {
            values: {
              ...data,
              ogTitle: data?.ogTitle || '',
              ogDescription: data?.ogDescription || '',
              ogImageUrl: data?.ogImageUrl || '',
            },
          }
        : {
            defaultValues: {
              slug: initialSlug,
              ogTitle: '',
              ogDescription: '',
              ogImageUrl: '',
            },
          })}
    >
      {({ setValue, watch }) => {
        const currentSlug = watch('slug') ?? initialSlug;

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

            <Column>
              <Label>{formatMessage(labels.link)}</Label>
              <Row alignItems="center" gap>
                <TextField
                  value={`${hostUrl}/${currentSlug}`}
                  autoComplete="off"
                  isReadOnly
                  allowCopy
                  style={{ flex: 1 }}
                />
                <Button
                  variant="quiet"
                  onPress={() => setValue('slug', handleSlug(), { shouldDirty: true })}
                >
                  <Icon>
                    <RefreshCw />
                  </Icon>
                </Button>
              </Row>
            </Column>

            <Row
              alignItems="center"
              gap="2"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Icon size="sm">{showAdvanced ? <ChevronDown /> : <ChevronRight />}</Icon>
              <Label style={{ cursor: 'pointer' }}>{formatMessage(labels.advanced)}</Label>
            </Row>

            {showAdvanced && (
              <Column gap="3">
                <FormField label={formatMessage(labels.title)} name="ogTitle">
                  <TextField autoComplete="off" />
                </FormField>

                <FormField label={formatMessage(labels.description)} name="ogDescription">
                  <TextField autoComplete="off" />
                </FormField>

                <FormField label={formatMessage(labels.imageUrl)} name="ogImageUrl">
                  <TextField autoComplete="off" />
                </FormField>

                <FormField
                  label={formatMessage(labels.path)}
                  name="slug"
                  rules={{
                    required: formatMessage(labels.required),
                    minLength: { value: 4, message: formatMessage(labels.tooShort) },
                    maxLength: { value: 100, message: formatMessage(labels.tooLong) },
                  }}
                >
                  <TextField autoComplete="off" minLength={4} maxLength={100} />
                </FormField>
              </Column>
            )}

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
