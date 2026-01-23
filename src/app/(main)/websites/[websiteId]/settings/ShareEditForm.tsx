import {
  Button,
  Checkbox,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  Label,
  Loading,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useApi, useConfig, useMessages, useModified } from '@/components/hooks';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { SHARE_NAV_ITEMS } from './constants';

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
    const parameters: Record<string, boolean> = {};
    SHARE_NAV_ITEMS.forEach(section => {
      section.items.forEach(item => {
        parameters[item.id] = data[item.id] ?? false;
      });
    });

    await mutateAsync(
      { name: data.name, slug: share.slug, parameters },
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

  // Build default values from share parameters
  const defaultValues: Record<string, any> = {
    name: share?.name || '',
  };
  SHARE_NAV_ITEMS.forEach(section => {
    section.items.forEach(item => {
      const defaultSelected = item.id === 'overview' || item.id === 'events';
      defaultValues[item.id] = share?.parameters?.[item.id] ?? defaultSelected;
    });
  });

  // Get all item ids for validation
  const allItemIds = SHARE_NAV_ITEMS.flatMap(section => section.items.map(item => item.id));

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} defaultValues={defaultValues}>
      {({ watch }) => {
        const values = watch();
        const hasSelection = allItemIds.some(id => values[id]);

        return (
          <Column gap="6">
            <Column>
              <Label>{formatMessage(labels.shareUrl)}</Label>
              <TextField value={url} isReadOnly allowCopy />
            </Column>
            <FormField
              label={formatMessage(labels.name)}
              name="name"
              rules={{ required: formatMessage(labels.required) }}
            >
              <TextField autoComplete="off" />
            </FormField>
            <Grid columns="repeat(auto-fit, minmax(150px, 1fr))" gap="3">
              {SHARE_NAV_ITEMS.map(section => (
                <Column key={section.section} gap="3">
                  <Text weight="bold">{formatMessage((labels as any)[section.section])}</Text>
                  <Column gap="1">
                    {section.items.map(item => (
                      <FormField key={item.id} name={item.id}>
                        <Checkbox>{formatMessage((labels as any)[item.label])}</Checkbox>
                      </FormField>
                    ))}
                  </Column>
                </Column>
              ))}
            </Grid>
            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {formatMessage(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton variant="primary" isDisabled={!hasSelection || !values.name}>
                {formatMessage(labels.save)}
              </FormSubmitButton>
            </Row>
          </Column>
        );
      }}
    </Form>
  );
}
