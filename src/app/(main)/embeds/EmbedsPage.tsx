'use client';
import {
  Button,
  Checkbox,
  Column,
  Grid,
  Label,
  Row,
  Text,
  Textarea,
  TextField,
  useToast,
} from '@umami/react-zen';
import { useCallback, useEffect, useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi, useConfig } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { ThemeModeSelector } from '@/components/input/ThemeModeSelector';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { getEmbedSnippet, getEmbedUrl } from '@/components/share/EmbedSettings';
import { SimpleShareEditButton } from '@/components/share/SimpleShareEditButton';
import { EMBED_PERIODS, EMBED_WIDGETS } from '@/lib/embed-widgets';
import { normalizeEmbedOrigins } from '@/lib/share';

const rid = () => Math.random().toString(36).slice(2, 10);

function EmbedRow({ board, onDeleted }: { board: any; onDeleted: () => void }) {
  const { get, del } = useApi() as any;
  const config = useConfig();
  const { toast } = useToast();
  const [share, setShare] = useState<any>(null);
  const cfg = board.parameters?.embedConfig || {};

  useEffect(() => {
    get(`/boards/${board.id}/shares`).then((res: any) => setShare(res?.data?.[0] || null));
  }, [board.id, get]);

  const origins: string[] = share?.parameters?.embedOrigins || [];
  const query = new URLSearchParams();
  if (cfg.date) query.set('date', cfg.date);
  if (cfg.theme) query.set('theme', cfg.theme);
  const url = share
    ? `${getEmbedUrl(share.slug, config?.cloudMode)}${query.toString() ? `?${query}` : ''}`
    : '';

  const remove = async () => {
    if (share) await del(`/share/id/${share.id}`);
    await del(`/boards/${board.id}`);
    toast('Embed deleted');
    onDeleted();
  };

  return (
    <Panel>
      <Column gap="3">
        <Row justifyContent="space-between" alignItems="center" gap>
          <Column gap="1">
            <Text weight="bold">{board.name}</Text>
            <Text color="muted">
              {(board.parameters?.rows || []).length} widgets ·{' '}
              {origins.length ? origins.join(', ') : 'no allowed sites yet'}
            </Text>
          </Column>
          <Row gap>
            {share && <SimpleShareEditButton shareId={share.id} />}
            <Button variant="quiet" onPress={remove} aria-label="Delete embed">
              <Trash size={16} />
            </Button>
          </Row>
        </Row>
        {share && (
          <>
            <Textarea
              value={getEmbedSnippet(url, share.slug)}
              readOnly
              rows={6}
              className="code-textarea"
              aria-label="Embed code"
            />
            <TextField value={url} isReadOnly allowCopy aria-label="Embed URL" />
          </>
        )}
      </Column>
    </Panel>
  );
}

export function EmbedsPage() {
  const { get, post } = useApi() as any;
  const { toast } = useToast();
  const [boards, setBoards] = useState<any[]>([]);
  const [websiteId, setWebsiteId] = useState<string>();
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>(['metrics', 'chart']);
  const [date, setDate] = useState('7day');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [origins, setOrigins] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    get('/boards', { pageSize: 100 }).then((res: any) =>
      setBoards((res?.data || []).filter((b: any) => b.parameters?.embedWidget)),
    );
  }, [get]);

  useEffect(load, [load]);

  const toggle = (id: string) =>
    setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const valid = !!websiteId && !!name.trim() && picked.length > 0;
  const parsedOrigins = normalizeEmbedOrigins(origins);

  const create = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      const rows = EMBED_WIDGETS.filter(w => picked.includes(w.id)).map(w => ({
        id: rid(),
        columns: [
          {
            id: rid(),
            component: {
              type: w.type,
              websiteId,
              ...(w.props ? { props: w.props } : {}),
            },
          },
        ],
      }));
      const board = await post('/boards', {
        type: 'mixed',
        name: name.trim(),
        description: 'Embeddable widget',
        parameters: {
          rows,
          embedWidget: true,
          embedConfig: { date, theme: theme === 'system' ? undefined : theme },
        },
      });
      await post(`/boards/${board.id}/shares`, {
        name: name.trim(),
        parameters: { allowFilter: false, embed: true, embedOrigins: parsedOrigins },
      });
      setName('');
      toast('Embed created. Copy the code below.');
      load();
    } catch (e: any) {
      toast(e?.message || 'Could not create embed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader
          title="Stats embeds"
          description="Show live analytics (visitors, top pages…) on any external site with a code snippet."
        />
        <Panel>
          <Column gap="5">
            <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap="4">
              <Column gap="1">
                <Label>Website</Label>
                <WebsiteSelect websiteId={websiteId} onChange={(v: any) => setWebsiteId(v)} />
              </Column>
              <Column gap="1">
                <Label>Name</Label>
                <TextField
                  value={name}
                  onChange={setName}
                  aria-label="Name"
                  placeholder="Homepage stats"
                />
              </Column>
            </Grid>
            <Column gap="2">
              <Label>Widgets</Label>
              <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap="2">
                {EMBED_WIDGETS.map(w => (
                  <Checkbox
                    key={w.id}
                    isSelected={picked.includes(w.id)}
                    onChange={() => toggle(w.id)}
                  >
                    <Column>
                      <Text weight="bold">{w.label}</Text>
                      <Text color="muted">{w.description}</Text>
                    </Column>
                  </Checkbox>
                ))}
              </Grid>
            </Column>
            <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap="4">
              <Column gap="1">
                <Label>Period</Label>
                <Row gap wrap="wrap">
                  {EMBED_PERIODS.map(p => (
                    <Button
                      key={p.value}
                      variant={date === p.value ? 'primary' : undefined}
                      onPress={() => setDate(p.value)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </Row>
              </Column>
              <Column gap="1">
                <Label>Theme</Label>
                <ThemeModeSelector includeSystem value={theme} onChange={v => setTheme(v as any)} />
              </Column>
            </Grid>
            <Column gap="1">
              <Label>Allowed sites (one origin per line)</Label>
              <Textarea
                value={origins}
                onChange={(e: any) => setOrigins(e?.target ? e.target.value : e)}
                rows={3}
                placeholder={'https://example.com\nhttps://www.example.com'}
                aria-label="Allowed sites"
              />
              <Text color="muted">
                Only these sites can display the widget. Read-only; no account data or tokens are
                exposed.
                {origins.trim() && parsedOrigins.length === 0 ? ' No valid origin found.' : ''}
              </Text>
            </Column>
            <Row>
              <Button variant="primary" onPress={create} isDisabled={!valid || busy}>
                Create embed
              </Button>
            </Row>
          </Column>
        </Panel>
        <Column gap="3">
          {boards.length === 0 ? (
            <Text color="muted">No embeds yet.</Text>
          ) : (
            boards.map(b => <EmbedRow key={b.id} board={b} onDeleted={load} />)
          )}
        </Column>
      </Column>
    </PageBody>
  );
}
