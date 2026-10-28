'use client';
import { Button, Column, Label, Row, Text } from '@umami/react-zen';
import { useCallback, useEffect, useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks';
import { Trash } from '@/components/icons';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

const PAGE_SIZE = 50;

function csvCell(v: unknown) {
  const s = String(v ?? '');
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function LeadsPage() {
  const { get, del } = useApi() as any;
  const [websiteId, setWebsiteId] = useState<string>();
  const [page, setPage] = useState(1);
  const [res, setRes] = useState<{ data: any[]; count: number }>({ data: [], count: 0 });

  const load = useCallback(() => {
    if (!websiteId) return;
    get(`/websites/${websiteId}/leads`, { page, pageSize: PAGE_SIZE }).then(setRes);
  }, [get, websiteId, page]);

  useEffect(load, [load]);

  const exportCsv = async () => {
    // Walk every page: the API returns at most 500 leads at a time.
    const all = { data: [] as any[] };
    for (let pageNo = 1; ; pageNo++) {
      const chunk = await get(`/websites/${websiteId}/leads`, { page: pageNo, pageSize: 500 });
      all.data.push(...chunk.data);
      if (chunk.data.length === 0 || all.data.length >= chunk.count) break;
    }
    const rows = all.data.map((l: any) =>
      [
        l.createdAt,
        l.widget?.name,
        l.data?.name,
        l.data?.phone,
        l.data?.email,
        l.data?.comment,
        l.pageUrl,
      ]
        .map(csvCell)
        .join(','),
    );
    const csv = ['Date,Widget,Name,Phone,Email,Comment,Page', ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pages = Math.max(1, Math.ceil(res.count / PAGE_SIZE));

  return (
    <PageBody>
      <Column gap="6">
        <PageHeader title="Leads" description="Requests collected by your site widgets." />
        <Panel>
          <Row justifyContent="space-between" alignItems="flex-end" gap wrap="wrap">
            <Column gap="1" style={{ minWidth: 260 }}>
              <Label>Website</Label>
              <WebsiteSelect
                websiteId={websiteId}
                onChange={(v: any) => {
                  setWebsiteId(v);
                  setPage(1);
                }}
              />
            </Column>
            <Button onPress={exportCsv} isDisabled={!websiteId || res.count === 0}>
              Export CSV
            </Button>
          </Row>
        </Panel>
        {websiteId && (
          <Panel>
            {res.data.length === 0 ? (
              <Text color="muted">No leads yet.</Text>
            ) : (
              <Column gap="2">
                {res.data.map(l => (
                  <Row
                    key={l.id}
                    justifyContent="space-between"
                    alignItems="center"
                    gap
                    className="lead-row"
                  >
                    <Column gap="1">
                      <Text weight="bold">
                        {[l.data?.name, l.data?.phone, l.data?.email].filter(Boolean).join(' · ')}
                      </Text>
                      <Text color="muted">
                        {new Date(l.createdAt).toLocaleString()} · {l.widget?.name}
                        {l.pageUrl ? ` · ${l.pageUrl}` : ''}
                        {l.deliveryStatus
                          ? ` · ${Object.entries(l.deliveryStatus)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}`
                          : ''}
                      </Text>
                      {l.data?.comment && <Text>{l.data.comment}</Text>}
                    </Column>
                    <Button
                      variant="quiet"
                      aria-label="Delete lead"
                      onPress={async () => {
                        await del(`/leads/${l.id}`);
                        load();
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </Row>
                ))}
                <Row gap alignItems="center" justifyContent="flex-end">
                  <Button isDisabled={page <= 1} onPress={() => setPage(p => p - 1)}>
                    Prev
                  </Button>
                  <Text>
                    {page} / {pages}
                  </Text>
                  <Button isDisabled={page >= pages} onPress={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </Row>
              </Column>
            )}
          </Panel>
        )}
      </Column>
    </PageBody>
  );
}
