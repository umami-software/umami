'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Code,
  Column,
  DataColumn,
  DataTable,
  Grid,
  Label,
  Row,
  Text,
} from '@umami/react-zen';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/common/Badge';
import { DataGrid } from '@/components/common/DataGrid';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useApi } from '@/components/hooks/useApi';
import { useFormat } from '@/components/hooks/useFormat';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useTimezone } from '@/components/hooks/useTimezone';
import { ArrowLeft } from '@/components/icons';
import { SessionModal } from '../../sessions/SessionModal';
import { WebsiteControls } from '../../WebsiteControls';
import { ErrorFilters, ErrorStats, useErrorFilters, useErrorQuery } from '../ErrorShared';

export function ErrorIssuePage({ websiteId, issueId }: { websiteId: string; issueId: string }) {
  const t = useTranslations('errorTracking');
  const filters = useErrorFilters();
  const issue = useErrorQuery(websiteId, `/${issueId}`, filters);
  const events = useErrorQuery(websiteId, `/${issueId}/events`, filters);
  const settings = useErrorQuery(websiteId, '/settings');
  const { query, renderUrl, updateParams } = useNavigation();
  const { formatTimezoneDate } = useTimezone();
  const { formatValue } = useFormat();
  const eventId = events.data?.data.some(row => row.id === query.occurrence)
    ? query.occurrence
    : events.data?.data[0]?.id;
  const occurrence = useErrorQuery(websiteId, `/${issueId}/events/${eventId}`, {}, !!eventId);
  const { patch, useMutation } = useApi();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: string) => patch(`/websites/${websiteId}/errors/${issueId}`, { status }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['errors', websiteId] }),
  });
  const event = occurrence.data;

  return (
    <Column gap>
      <Row marginTop="6">
        <Link
          href={renderUrl(`/websites/${websiteId}/errors`, {
            page: undefined,
            occurrence: undefined,
          })}
        >
          <IconLabel icon={<ArrowLeft />} label={t('title')} />
        </Link>
      </Row>
      <LoadingPanel
        data={issue.data}
        isLoading={issue.isLoading}
        error={issue.error}
        minHeight="300px"
      >
        {issue.data && (
          <Column gap>
            <PageHeader
              title={issue.data.title}
              titleSuffix={
                <Badge
                  variant={
                    issue.data.status === 'resolved'
                      ? 'good'
                      : issue.data.status === 'ignored'
                        ? 'gray'
                        : 'warning'
                  }
                >
                  {t(issue.data.status)}
                </Badge>
              }
            >
              <Row gap="2" alignItems="center" justifyContent="flex-end" wrap="wrap">
                {settings.data?.canManage &&
                  ['unresolved', 'resolved', 'ignored']
                    .filter(status => status !== issue.data.status)
                    .map(status => (
                      <Button
                        key={status}
                        isDisabled={mutation.isPending}
                        onPress={() => mutation.mutate(status)}
                      >
                        {t(`action-${status}`)}
                      </Button>
                    ))}
              </Row>
            </PageHeader>
            {(mutation.error || settings.error) && <ErrorMessage />}
            <WebsiteControls websiteId={websiteId} allowFilter={false} />
            <ErrorStats data={issue.data} {...filters} />
          </Column>
        )}
      </LoadingPanel>
      <Panel title={t('occurrences')}>
        <ErrorFilters websiteId={websiteId} issueId={issueId} />
        <DataGrid query={events} allowSearch searchWidth={280} autoFocus={false}>
          {({ data }) => (
            <DataTable data={data}>
              <DataColumn id="createdAt" label={t('time')}>
                {row => (
                  <Link
                    href={updateParams({ occurrence: row.id })}
                    scroll={false}
                    aria-current={row.id === eventId ? 'true' : undefined}
                  >
                    <Text weight={row.id === eventId ? 'bold' : undefined}>
                      {formatTimezoneDate(row.createdAt, 'PPpp')}
                    </Text>
                  </Link>
                )}
              </DataColumn>
              <DataColumn id="urlPath" label={t('urlPath')} width="2fr">
                {row => <Text style={{ overflowWrap: 'anywhere' }}>{row.urlPath}</Text>}
              </DataColumn>
              {['release', 'environment'].map(key => (
                <DataColumn key={key} id={key} label={t(key)}>
                  {row => row[key] || '—'}
                </DataColumn>
              ))}
              <DataColumn id="browser" label={t('browser')}>
                {row =>
                  row.browser ? (
                    <TypeIcon type="browser" value={row.browser}>
                      {formatValue(row.browser, 'browser')}
                    </TypeIcon>
                  ) : (
                    '—'
                  )
                }
              </DataColumn>
            </DataTable>
          )}
        </DataGrid>
      </Panel>
      {eventId && (
        <LoadingPanel
          data={event}
          isLoading={occurrence.isLoading}
          error={occurrence.error}
          minHeight="200px"
        >
          {event && (
            <Panel title={t('details')}>
              <Row gap alignItems="center" wrap="wrap">
                <Link href={updateParams({ session: event.sessionId })}>{t('viewSession')}</Link>
                {event.replayId ? (
                  <Link
                    href={renderUrl(`/websites/${websiteId}/replays/${event.replayId}`, {
                      occurrence: undefined,
                    })}
                  >
                    {t('viewReplay')}
                  </Link>
                ) : (
                  <Text color="muted">{t('noReplay')}</Text>
                )}
              </Row>
              <Column gap="1">
                <Label>{t('urlPath')}</Label>
                <Text style={{ overflowWrap: 'anywhere' }}>{event.urlPath || '—'}</Text>
              </Column>
              <Grid columns="repeat(auto-fit, minmax(160px, 1fr))" gap>
                {['release', 'environment'].map(key => (
                  <Column key={key} gap="1">
                    <Label>{t(key)}</Label>
                    <Text style={{ overflowWrap: 'anywhere' }}>{event[key] || '—'}</Text>
                  </Column>
                ))}
                {(['browser', 'os', 'device'] as const).map(key => (
                  <Column key={key} gap="1">
                    <Label>{t(key)}</Label>
                    {event[key] ? (
                      <TypeIcon type={key} value={event[key]}>
                        <Text>{formatValue(event[key], key)}</Text>
                      </TypeIcon>
                    ) : (
                      <Text>—</Text>
                    )}
                  </Column>
                ))}
                <Column gap="1">
                  <Label>{t('capture')}</Label>
                  <Text>{event.handled ? t('handled') : t('unhandled')}</Text>
                </Column>
              </Grid>
              <Text weight="bold" style={{ overflowWrap: 'anywhere' }}>
                {event.name}: {event.message}
              </Text>
              <Code style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {event.stack || t('noStack')}
              </Code>
              {Object.keys(event.tags).length > 0 && (
                <Column gap="2">
                  <Label>{t('tags')}</Label>
                  <Code style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    {JSON.stringify(event.tags, null, 2)}
                  </Code>
                </Column>
              )}
            </Panel>
          )}
        </LoadingPanel>
      )}
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
