'use client';
import {
  Button,
  Column,
  Grid,
  Label,
  Row,
  Switch,
  Text,
  Textarea,
  TextField,
  useToast,
} from '@umami/react-zen';
import { useCallback, useEffect, useState } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi, useNavigation } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { WIDGET_LABELS, type WidgetType } from '@/lib/marketing-widgets';
import { WIDGET_TEMPLATES, type WidgetTemplate } from '@/lib/widget-templates';
import { WidgetCatalog } from './WidgetCatalog';
import { WidgetEditor } from './WidgetEditor';
import { WidgetPreview } from './WidgetPreview';

type Check = { found: boolean; url?: string; reason?: string; detail?: string } | null;

function checkMessage(c: NonNullable<Check>) {
  if (c.found) return `Installed. Found the snippet on ${c.url}`;
  switch (c.reason) {
    case 'wrong-site':
      return 'A widgets snippet was found, but for a different website ID. Copy the code above.';
    case 'not-found':
      return 'The snippet was not found on the home page. If you add it via Tag Manager or a single-page app, it may load later: install it in the page HTML and check again.';
    case 'blocked':
      return 'Cannot check this address (private or invalid host).';
    default:
      return `Could not open the site${c.detail ? `: ${c.detail}` : ''}. Is the domain set correctly in the website settings?`;
  }
}

export function WidgetsPage() {
  const { get, put, del, post } = useApi() as any;
  const { toast } = useToast();
  const { renderUrl } = useNavigation();
  const [websiteId, setWebsiteId] = useState<string>();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [editing, setEditing] = useState<{
    type: WidgetType;
    widget?: any;
    template?: WidgetTemplate;
  } | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [check, setCheck] = useState<Check>(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(() => {
    if (!websiteId) return setWidgets([]);
    get(`/websites/${websiteId}/widgets`).then((res: any) =>
      setWidgets(Array.isArray(res) ? res : []),
    );
  }, [get, websiteId]);

  useEffect(load, [load]);

  const toggle = async (w: any, enabled: boolean) => {
    await put(`/widgets/${w.id}`, {
      type: w.type,
      name: w.name,
      enabled,
      config: w.config,
      delivery: w.delivery,
    });
    load();
  };

  const remove = async (w: any) => {
    await del(`/widgets/${w.id}`);
    toast('Widget deleted');
    load();
  };

  const runCheck = async () => {
    if (!websiteId) return;
    setChecking(true);
    setCheck(null);
    try {
      setCheck(await post(`/websites/${websiteId}/widgets/check`));
    } catch (e: any) {
      setCheck({ found: false, reason: 'unreachable', detail: e?.message });
    } finally {
      setChecking(false);
    }
  };

  const snippet = websiteId
    ? `<script async src="${typeof window !== 'undefined' ? window.location.origin : ''}/w.js" data-website="${websiteId}"></script>`
    : '';

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader
          title="Site widgets"
          description="Callback, announcements, pop-ups and email capture for your website. One code snippet, managed here."
        >
          <LinkButton href={renderUrl('/widgets/leads', false)}>Leads</LinkButton>
        </PageHeader>

        <Panel>
          <Column gap="1">
            <Label>Website</Label>
            <WebsiteSelect
              websiteId={websiteId}
              onChange={(v: any) => {
                setWebsiteId(v);
                setEditing(null);
                setCheck(null);
              }}
            />
          </Column>
        </Panel>

        {websiteId && editing && (
          <WidgetEditor
            key={editing.widget?.id || editing.template?.id || editing.type}
            websiteId={websiteId}
            type={editing.type}
            widget={editing.widget}
            template={editing.template}
            onSaved={() => {
              setEditing(null);
              load();
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        {websiteId && !editing && (
          <>
            <Panel>
              <Column gap="3">
                <Label>1. Install once on your site (before &lt;/body&gt;)</Label>
                <Textarea
                  value={snippet}
                  readOnly
                  rows={2}
                  className="code-textarea"
                  aria-label="Install code"
                />
                <TextField value={snippet} isReadOnly allowCopy aria-label="Install code copy" />
                <Row gap alignItems="center" wrap="wrap">
                  <Button variant="primary" onPress={runCheck} isDisabled={checking}>
                    {checking ? 'Checking…' : 'Check installation'}
                  </Button>
                  {check && (
                    <Text role="status" style={{ color: check.found ? '#16a34a' : '#dc2626' }}>
                      {check.found ? '✓ ' : '✕ '}
                      {checkMessage(check)}
                    </Text>
                  )}
                </Row>
                <Text color="muted">
                  We open your home page and look for the code above. Widgets appear only on the
                  website's own domain.
                </Text>
              </Column>
            </Panel>

            <Column gap="3">
              <Row justifyContent="space-between" alignItems="center">
                <Label>2. Your widgets</Label>
                <Button variant="primary" onPress={() => setCatalogOpen(true)}>
                  + Add widget
                </Button>
              </Row>
              {widgets.length === 0 && (
                <Panel>
                  <Column gap="3" alignItems="center" paddingY="4">
                    <Text weight="bold">No widgets yet</Text>
                    <Text color="muted">
                      Pick one from the catalog: {WIDGET_TEMPLATES.length} ready-made widgets in
                      different styles.
                    </Text>
                    <Button variant="primary" onPress={() => setCatalogOpen(true)}>
                      Open catalog
                    </Button>
                  </Column>
                </Panel>
              )}
              <Grid columns={{ base: '1fr', lg: '1fr 1fr' }} gap="4">
                {widgets.map(w => (
                  <Panel key={w.id}>
                    <Column gap="3">
                      <WidgetPreview
                        type={w.type}
                        config={w.config}
                        width={420}
                        height={230}
                        scale={0.62}
                      />
                      <Row justifyContent="space-between" alignItems="center" gap>
                        <Column gap="1">
                          <Text weight="bold">{w.name}</Text>
                          <Text color="muted">
                            {WIDGET_LABELS[w.type as WidgetType]} · {w.config?.trigger} ·{' '}
                            {w.config?.frequency}
                          </Text>
                        </Column>
                        <Row gap alignItems="center">
                          <Switch isSelected={w.enabled} onChange={v => toggle(w, v)}>
                            {w.enabled ? 'On' : 'Off'}
                          </Switch>
                          <Button onPress={() => setEditing({ type: w.type, widget: w })}>
                            Edit
                          </Button>
                          <Button
                            variant="quiet"
                            aria-label="Delete widget"
                            onPress={() => remove(w)}
                          >
                            <Trash size={16} />
                          </Button>
                        </Row>
                      </Row>
                    </Column>
                  </Panel>
                ))}
              </Grid>
            </Column>

            <WidgetCatalog
              isOpen={catalogOpen}
              onOpenChange={setCatalogOpen}
              onPick={tpl => {
                setCatalogOpen(false);
                setEditing({ type: tpl.type, template: tpl });
              }}
              onBlank={type => {
                setCatalogOpen(false);
                setEditing({ type });
              }}
            />
          </>
        )}
      </Column>
    </PageBody>
  );
}
