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
  Text,
  TextField,
} from '@umami/react-zen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useConfig, useLinkQuery, useMessages } from '@/components/hooks';
import { getClientAuthToken } from '@/lib/client';
import { useUpdateQuery } from '@/components/hooks/queries/useUpdateQuery';
import { ChevronDown, RefreshCw } from '@/components/icons';
import { LINKS_URL } from '@/lib/constants';
import { getRandomChars } from '@/lib/generate';

const OG_FIELDS = ['ogTitle', 'ogDescription', 'ogImage'] as const;
type OgField = (typeof OG_FIELDS)[number];

interface OgPreview {
  title: string | null;
  description: string | null;
  image: string | null;
}

const generateId = () => getRandomChars(9);

function ImagePreviewInner({ src, label }: Readonly<{ src: string; label: string }>) {
  // Parent uses key={src} → new src remounts and resets `broken`.
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <Row alignItems="center" gap="2">
      <Text size="sm" color="muted">
        {label}
      </Text>
      <img
        src={src}
        alt=""
        loading="lazy"
        style={{ maxHeight: 80, borderRadius: 4 }}
        onError={() => setBroken(true)}
      />
    </Row>
  );
}

function ImagePreview(props: Readonly<{ src: string; label: string }>) {
  if (!props.src) return null;
  return <ImagePreviewInner key={props.src} {...props} />;
}

function OgUrlWatcher({
  url,
  onPreview,
}: Readonly<{
  url: string;
  onPreview: (preview: OgPreview | null, loading: boolean) => void;
}>) {
  useEffect(() => {
    if (!url || !/^https?:\/\//i.test(url)) {
      onPreview(null, false);
      return;
    }
    const controller = new AbortController();
    onPreview(null, true);
    const handle = setTimeout(async () => {
      try {
        const basePath = process.env.basePath ?? '';
        const params = new URLSearchParams({ url });
        const res = await fetch(`${basePath}/api/links/og-preview?${params.toString()}`, {
          signal: controller.signal,
          headers: { authorization: `Bearer ${getClientAuthToken()}` },
        });
        if (controller.signal.aborted) return;
        if (!res.ok) {
          onPreview(null, false);
          return;
        }
        const data = (await res.json()) as OgPreview;
        if (!controller.signal.aborted) onPreview(data, false);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          onPreview(null, false);
        }
      }
    }, 800);
    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [url, onPreview]);
  return null;
}

export function LinkEditForm({
  linkId,
  teamId,
  onSave,
  onClose,
}: Readonly<{
  linkId?: string;
  teamId?: string;
  onSave?: () => void;
  onClose?: () => void;
}>) {
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
  const linksUrl = config?.linksUrl;
  const hostUrl = linksUrl || LINKS_URL;
  const { data, isLoading } = useLinkQuery(linkId);
  const [defaultSlug] = useState(generateId());
  const [utmExpanded, setUtmExpanded] = useState(false);
  const [ogExpanded, setOgExpanded] = useState(false);
  const [livePreview, setLivePreview] = useState<OgPreview | null>(null);
  const dirtyFieldsRef = useRef<Record<string, any>>({});

  const handleLivePreview = useCallback((preview: OgPreview | null, _loading: boolean) => {
    setLivePreview(preview);
  }, []);

  useEffect(() => {
    if (
      data &&
      (data.utmSource ||
        data.utmMedium ||
        data.utmCampaign ||
        data.utmTerm ||
        data.utmContent)
    ) {
      setUtmExpanded(true);
    }
    if (data && (data.ogTitleManual || data.ogDescriptionManual || data.ogImageManual)) {
      setOgExpanded(true);
    }
  }, [data]);

  const handleSubmit = async (formData: any) => {
    // Drop untouched empty OG fields so backend doesn't treat them as clear-to-auto.
    const cleaned = { ...formData };
    const dirty = dirtyFieldsRef.current ?? {};
    for (const f of OG_FIELDS) {
      if (!dirty[f] && (cleaned[f] === '' || cleaned[f] == null)) {
        delete cleaned[f];
      }
    }
    await mutateAsync(cleaned, {
      onSuccess: async () => {
        toast(t(messages.saved));
        touch('links');
        touch(`link:${linkId}`);
        onSave?.();
        onClose?.();
      },
    });
  };

  // Seed inputs only when *Manual=true so auto values aren't promoted to manual.
  const ogDefaults = {
    ogTitle: data?.ogTitleManual ? data?.ogTitle ?? '' : '',
    ogDescription: data?.ogDescriptionManual ? data?.ogDescription ?? '' : '',
    ogImage: data?.ogImageManual ? data?.ogImage ?? '' : '',
  };
  // Live preview takes precedence over stored parsed values for placeholder hints.
  const autoValues: Record<OgField, string | null | undefined> = {
    ogTitle: livePreview?.title ?? (data?.ogTitleManual ? null : data?.ogTitle),
    ogDescription:
      livePreview?.description ?? (data?.ogDescriptionManual ? null : data?.ogDescription),
    ogImage: livePreview?.image ?? (data?.ogImageManual ? null : data?.ogImage),
  };

  const checkUrl = (url: string) => {
    try {
      const u = new URL(url);
      if ((u.protocol === 'http:' || u.protocol === 'https:') && u.host) return true;
    } catch {}
    return t(labels.invalidUrl);
  };

  if (linkId && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      defaultValues={{ slug: defaultSlug, ...data, ...ogDefaults }}
    >
      {({ setValue, watch, formState }) => {
        const slug = watch('slug');
        const url = watch('url');
        // Mirror dirtyFields to a ref so handleSubmit can read it at submit time.
        dirtyFieldsRef.current = formState.dirtyFields;

        return (
          <>
            <OgUrlWatcher url={url} onPreview={handleLivePreview} />
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

            <Column gap="2">
              <Button
                variant="quiet"
                onPress={() => setOgExpanded(v => !v)}
                style={{ alignSelf: 'flex-start' }}
                aria-expanded={ogExpanded}
                aria-controls="og-section"
              >
                <Icon rotate={ogExpanded ? 180 : 0}>
                  <ChevronDown />
                </Icon>
                {t(labels.customizePreview)}
              </Button>
              {ogExpanded && (
                <Column id="og-section" gap="2">
                  <Text size="sm" color="muted">
                    {t(labels.customizePreviewDescription)}
                  </Text>
                  <FormField label={t(labels.title)} name="ogTitle">
                    <TextField
                      autoComplete="off"
                      maxLength={255}
                      placeholder={
                        autoValues.ogTitle
                          ? `${t(labels.autoDetectedFromDestination)}: ${autoValues.ogTitle}`
                          : t(labels.autoDetectedFromDestination)
                      }
                    />
                  </FormField>
                  <FormField label={t(labels.description)} name="ogDescription">
                    <TextField
                      autoComplete="off"
                      maxLength={500}
                      placeholder={
                        autoValues.ogDescription
                          ? `${t(labels.autoDetectedFromDestination)}: ${autoValues.ogDescription}`
                          : t(labels.autoDetectedFromDestination)
                      }
                    />
                  </FormField>
                  <FormField label={t(labels.imageUrl)} name="ogImage">
                    <TextField
                      autoComplete="off"
                      maxLength={2047}
                      placeholder={
                        autoValues.ogImage
                          ? `${t(labels.autoDetectedFromDestination)}: ${autoValues.ogImage}`
                          : t(labels.autoDetectedFromDestination)
                      }
                    />
                  </FormField>
                  <ImagePreview
                    src={watch('ogImage') || autoValues.ogImage || ''}
                    label={t(labels.preview)}
                  />
                </Column>
              )}
            </Column>

            <Column gap="2">
              <Button
                variant="quiet"
                onPress={() => setUtmExpanded(v => !v)}
                style={{ alignSelf: 'flex-start' }}
                aria-expanded={utmExpanded}
                aria-controls="utm-section"
              >
                <Icon rotate={utmExpanded ? 180 : 0}>
                  <ChevronDown />
                </Icon>
                {t(labels.utm)}
              </Button>
              {utmExpanded && (
                <Column id="utm-section" gap="2">
                  <Text size="sm" color="muted">
                    {t(labels.utmDescription)}
                  </Text>
                  <FormField label={t(labels.utmSource)} name="utmSource">
                    <TextField autoComplete="off" maxLength={255} />
                  </FormField>
                  <FormField label={t(labels.utmMedium)} name="utmMedium">
                    <TextField autoComplete="off" maxLength={255} />
                  </FormField>
                  <FormField label={t(labels.utmCampaign)} name="utmCampaign">
                    <TextField autoComplete="off" maxLength={255} />
                  </FormField>
                  <FormField label={t(labels.utmTerm)} name="utmTerm">
                    <TextField autoComplete="off" maxLength={255} />
                  </FormField>
                  <FormField label={t(labels.utmContent)} name="utmContent">
                    <TextField autoComplete="off" maxLength={255} />
                  </FormField>
                </Column>
              )}
            </Column>

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

            <Column>
              <Label>{t(labels.link)}</Label>
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
