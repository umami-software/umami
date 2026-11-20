import {
  Button,
  Checkbox,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Grid,
  Label,
  ListSeparator,
  Loading,
  Row,
  Switch,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useApi, useConfig, useMessages, useModified } from '@/components/hooks';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';
import { SHARE_NAV_ITEMS } from './constants';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FilterEditForm } from '@/components/input/FilterEditForm';
import {
  filtersArrayToObject,
  serializeSessionPropertyFilters,
  serializeUniversalEventPropertyFilters,
} from '@/lib/params';

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
  const [presetFilters, setPresetFilters] = useState<Record<string, string>>({});
  
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
        setPresetFilters(data.parameters?.presetFilters ?? {});
      } finally {
        setIsLoading(false);
      }
    };
    loadShare();
  }, [shareId, modified]);

  const handleSubmit = async (data: any) => {
    const parameters: Record<string, boolean | string | undefined> = {};
    SHARE_NAV_ITEMS.forEach(section => {
      section.items.forEach(item => {
        parameters[item.id] = data[item.id] ?? false;
      });
    });
    parameters.allowFilter = Object.keys(presetFilters).length ? false : (data.allowFilter ?? true);
    parameters.theme = data.theme === 'system' ? undefined : data.theme;
    parameters.presetFilters = Object.keys(presetFilters).length ? presetFilters : undefined;
    
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
    allowFilter:
      Object.keys(share?.parameters?.presetFilters ?? {}).length > 0
        ? false
        : (share?.parameters?.allowFilter ?? true),
    theme: share?.parameters?.theme || 'system',
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
            {url && (
              <Column gap="1">
                <Label>{t(labels.shareUrl)}</Label>
                <TextField value={url} isReadOnly allowCopy />
              </Column>
            )}
            <FormField label={t(labels.name)} name="name" rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus={!isEditing} />
            </FormField>
            <Grid columns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="3">
              <FormField label={t(labels.filters)} name="allowFilter">
                <Switch
                  isSelected={watch('allowFilter')}
                  isDisabled={Object.keys(presetFilters).length > 0}
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
            <DialogButton
              icon={<ListFilter size={16} />}
              label={t(labels.filter)}
              title={t(labels.filters)}
              type="button"
              variant="outline"
              width="900px"
            >
              {({ close }) => (
                <FilterEditForm
                  websiteId={websiteId}
                  initialFilters={presetFilters}
                  onClose={close}
                  onChange={({
                    filters,
                    eventPropertyFilters,
                    sessionPropertyFilters,
                    segment,
                    cohort,
                    match,
                  }) => {
                    const hasFilters =
                      filters.length > 0 ||
                      eventPropertyFilters.length > 0 ||
                      sessionPropertyFilters.length > 0 ||
                      !!segment ||
                      !!cohort;
                    const nextFilters = {
                      ...filtersArrayToObject(filters),
                      ...serializeUniversalEventPropertyFilters(eventPropertyFilters),
                      ...serializeSessionPropertyFilters(sessionPropertyFilters),
                      ...(segment ? { segment } : {}),
                      ...(cohort ? { cohort } : {}),
                      ...(hasFilters ? { match: match || 'all' } : {}),
                    };
                    setPresetFilters(
                      Object.fromEntries(
                        Object.entries(nextFilters).filter(
                          ([, value]) => value !== undefined && value !== '',
                        ),
                      ),
                    );
                    setValue('allowFilter', false, { shouldDirty: true });
                  }}
                />
              )}
            </DialogButton>
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
