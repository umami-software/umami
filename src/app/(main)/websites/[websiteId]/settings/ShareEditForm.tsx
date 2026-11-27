import {
  Button,
  Checkbox,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  ListItem,
  ListSeparator,
  Loading,
  Row,
  Select,
  Switch,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import {
  useApi,
  useConfig,
  useMessages,
  useModified,
  useWebsiteSegmentsQuery,
} from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';
import { ENTITY_TYPE } from '@/lib/constants';
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
  const [currentMatch, setCurrentMatch] = useState<string>('all');

  const isEditing = !!shareId;
  const targetWebsiteId =
    websiteId || (share?.shareType === ENTITY_TYPE.website ? share?.entityId : undefined);
  const { data: segmentsData } = useWebsiteSegmentsQuery(targetWebsiteId, { type: 'segment' });

  const getUrl = (slug: string) => {
    return `${cloudMode ? process.env.cloudUrl : window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
  };

  useEffect(() => {
    setCurrentMatch(share?.parameters?.match || 'all');
  }, [share]);

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
    const parameters: Record<string, any> = {};
    SHARE_NAV_ITEMS.forEach(section => {
      section.items.forEach(item => {
        parameters[item.id] = data[item.id] ?? false;
      });
    });
    parameters.allowFilter = data.allowFilter ?? true;
    parameters.theme = data.theme === 'system' ? undefined : data.theme;

    if (targetWebsiteId) {
      parameters.segment = data.segment || undefined;
      parameters.filters = data.filters?.length ? data.filters : undefined;
      parameters.match = currentMatch !== 'all' ? currentMatch : undefined;
    }

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
    allowFilter: share?.parameters?.allowFilter ?? true,
    theme: share?.parameters?.theme || 'system',
    segment: share?.parameters?.segment || '',
    filters: share?.parameters?.filters || [],
    match: share?.parameters?.match || 'all',
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
      {({ watch, setValue }) => {
        const values = watch();
        const hasSelection = allItemIds.some(id => values[id]);

        return (
          <Column gap="6">
            {url && <TextField label={t(labels.shareUrl)} value={url} isReadOnly allowCopy />}
            <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus={!isEditing} />
            </FormField>
            <Grid columns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="3">
              <FormField label={t(labels.filters)} name="allowFilter">
                <Switch
                  isSelected={watch('allowFilter')}
                  onChange={value => setValue('allowFilter', value, { shouldDirty: true })}
                >
                  {t(labels.filtersEnabled)}
                </Switch>
              </FormField>
              <FormField label={t(labels.theme)} name="theme">
                <ThemeModeSelector
                  value={watch('theme')}
                  includeSystem
                  onChange={value => setValue('theme', value, { shouldDirty: true })}
                />
              </FormField>
            </Grid>
            <ListSeparator />
            <Grid columns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="3">
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
            {targetWebsiteId && (
              <>
                <ListSeparator />
                <FormField label={t(labels.segment)} name="segment">
                  <Select>
                    <ListItem id="">{t(labels.none)}</ListItem>
                    {segmentsData?.data?.map((item: { id: string; name: string }) => (
                      <ListItem key={item.id} id={item.id}>
                        {item.name}
                      </ListItem>
                    ))}
                  </Select>
                </FormField>
                <Column gap="1">
                  <Text weight="bold">{t(labels.filters)}</Text>
                  <FormField name="filters">
                    <FieldFilters
                      websiteId={targetWebsiteId}
                      match={currentMatch}
                      onMatchChange={setCurrentMatch}
                    />
                  </FormField>
                </Column>
              </>
            )}
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
