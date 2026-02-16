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
import { SHARE_NAV_ITEMS } from './constants';

export function ShareEditForm({
  shareId,
  websiteId,
  onSave,
  onClose,
}: {
  shareId?: string;
  websiteId?: string;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const { t, labels, getErrorMessage } = useMessages();
  const { cloudMode } = useConfig();
  const { get, post } = useApi();
  const { touch } = useModified();
  const { modified } = useModified('shares');
  const [share, setShare] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!shareId);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<any>(null);

  const isEditing = !!shareId;

  const getUrl = (slug: string) => {
    return `${cloudMode ? process.env.cloudUrl : window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
  };

  useEffect(() => {
    if (!shareId) return;

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

    setIsPending(true);
    setError(null);

    try {
      if (isEditing) {
        await post(`/share/id/${shareId}`, {
          name: data.name,
          slug: share.slug,
          parameters,
        });
      } else {
        await post(`/websites/${websiteId}/shares`, {
          name: data.name,
          parameters,
        });
      }
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

  const url = isEditing ? getUrl(share?.slug || '') : null;

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
            {url && (
              <Column>
                <Label>{t(labels.shareUrl)}</Label>
                <TextField value={url} isReadOnly allowCopy />
              </Column>
            )}
            <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus={!isEditing} />
            </FormField>
            <Grid columns="repeat(auto-fit, minmax(150px, 1fr))" gap="3">
              {SHARE_NAV_ITEMS.map(section => (
                <Column key={section.section} gap="3">
                  <Text weight="bold">{t((labels as any)[section.section])}</Text>
                  <Column gap="1">
                    {section.items.map(item => (
                      <FormField key={item.id} name={item.id}>
                        <Checkbox>{t((labels as any)[item.label])}</Checkbox>
                      </FormField>
                    ))}
                  </Column>
                </Column>
              ))}
            </Grid>
            <Row justifyContent="flex-end" paddingTop="3" gap="3">
              {onClose && (
                <Button isDisabled={isPending} onPress={onClose}>
                  {t(labels.cancel)}
                </Button>
              )}
              <FormSubmitButton
                variant="primary"
                isDisabled={isPending || !hasSelection || !values.name}
              >
                {t(labels.save)}
              </FormSubmitButton>
            </Row>
          </Column>
        );
      }}
    </Form>
  );
}
