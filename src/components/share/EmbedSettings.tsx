import { Column, FormField, Label, Switch, Text, Textarea, TextField } from '@umami/react-zen';
import { useConfig } from '@/components/hooks';

export function getEmbedUrl(slug: string, cloudMode?: boolean) {
  return `${cloudMode ? process.env.cloudUrl : window?.location.origin}${process.env.basePath || ''}/embed/${slug}`;
}

export function getEmbedSnippet(url: string, slug: string) {
  return `<iframe id="umami-${slug}" src="${url}" style="width:100%;border:0;min-height:320px" loading="lazy" referrerpolicy="no-referrer"></iframe>
<script>
  window.addEventListener('message', function (e) {
    if (e.origin !== '${new URL(url).origin}' || !e.data || e.data.type !== 'umami-embed-height') return;
    document.getElementById('umami-${slug}').style.height = e.data.height + 'px';
  });
</script>`;
}

/**
 * Explicit public-access settings for embedding a board share on an external site.
 * Nothing is public unless the switch is on, and only the listed origins can frame it.
 */
export function EmbedSettings({
  watch,
  setValue,
  slug,
}: {
  watch: (name: string) => any;
  setValue: (name: string, value: any, options?: any) => void;
  slug?: string;
}) {
  const config = useConfig();
  const enabled = !!watch('embed');
  const url = slug ? getEmbedUrl(slug, config?.cloudMode) : '';

  return (
    <Column gap="3">
      <FormField name="embed">
        <Switch
          isSelected={enabled}
          onChange={value => setValue('embed', value, { shouldDirty: true })}
        >
          Allow embedding on external sites
        </Switch>
      </FormField>
      {enabled && (
        <>
          <FormField label="Allowed sites (one origin per line)" name="embedOrigins">
            <Textarea rows={3} placeholder={'https://example.com\nhttps://www.example.com'} />
          </FormField>
          <Text color="muted">
            Only the listed origins can display this widget; others are blocked by the browser. The
            embed exposes just the widgets on this board, read-only, with no account access.
          </Text>
          {slug && (
            <Column gap="1">
              <Label>Embed code</Label>
              <Textarea
                value={getEmbedSnippet(url, slug)}
                readOnly
                rows={7}
                className="code-textarea"
              />
              <TextField value={url} isReadOnly allowCopy aria-label="Embed URL" />
            </Column>
          )}
        </>
      )}
    </Column>
  );
}
