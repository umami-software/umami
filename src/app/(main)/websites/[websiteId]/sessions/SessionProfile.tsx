'use client';
import {
  Badge,
  Button,
  Column,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@umami/react-zen';
import { Avatar } from '@/components/common/Avatar';
import { CopyButton } from '@/components/common/CopyButton';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useConfig,
  useFormat,
  useMessages,
  useMobile,
  useNavigation,
  useSessionDataQuery,
  useWebsiteSessionQuery,
} from '@/components/hooks';
import { X } from '@/components/icons';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import { SessionDeleteButton } from './SessionDeleteButton';
import { SessionInfo } from './SessionInfo';
import styles from './SessionProfile.module.css';
import { SessionReplaysDataTable } from './SessionReplaysDataTable';
import { SessionStats } from './SessionStats';

export function SessionProfile({
  websiteId,
  sessionId,
  showReplays = true,
  onClose,
}: {
  websiteId: string;
  sessionId: string;
  showReplays?: boolean;
  onClose?: () => void;
}) {
  const { data, isLoading, error } = useWebsiteSessionQuery(websiteId, sessionId);
  const { data: propertiesData } = useSessionDataQuery(websiteId, sessionId);
  const config = useConfig();
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { isMobile } = useMobile();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const showDeleteButton = Boolean(
    !isSharePage && config?.sessionDeletionEnabled && data?.canDelete,
  );

  const singleDistinctId = data?.distinctIds?.length > 1 ? '' : data?.distinctId?.trim() || '';

  const locationSummary = [data?.city, data?.country ? formatValue(data.country, 'country') : '']
    .filter(Boolean)
    .join(', ');

  const summaryParts = [
    locationSummary,
    data?.browser ? formatValue(data.browser, 'browser') : '',
    data?.os ? formatValue(data.os, 'os') : '',
  ].filter(Boolean);

  const activityCount =
    data && (data.views !== undefined || data.events !== undefined)
      ? Number(data.views ?? 0) + Number(data.events ?? 0)
      : undefined;

  const propertiesCount = Array.isArray(propertiesData) ? propertiesData.length : undefined;

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      error={error}
      loadingIcon="spinner"
      loadingPlacement="absolute"
    >
      {data && (
        <Column gap="6" width="100%" minWidth="0">
          <div className={styles.header}>
            <div className={styles.identity}>
              <Avatar seed={data?.id} size={isMobile ? 48 : 56} />
              <div className={styles.identityText}>
                {singleDistinctId ? (
                  <>
                    <div className={styles.distinctTitle} title={singleDistinctId}>
                      {singleDistinctId}
                    </div>
                    <div className={styles.titleRow}>
                      <span className={styles.sessionIdSecondary} title={data.id}>
                        {data.id}
                      </span>
                      <CopyButton value={data.id} label={t(labels.copy)} />
                    </div>
                  </>
                ) : (
                  <div className={styles.titleRow}>
                    <span className={styles.sessionIdPrimary} title={data.id}>
                      {data.id}
                    </span>
                    <CopyButton value={data.id} label={t(labels.copy)} />
                  </div>
                )}

                {summaryParts.length > 0 && (
                  <div className={styles.summary} title={summaryParts.join(' · ')}>
                    {summaryParts.join(' · ')}
                  </div>
                )}
              </div>
            </div>

            {(onClose || showDeleteButton) && (
              <div className={styles.actions}>
                {showDeleteButton && (
                  <SessionDeleteButton
                    websiteId={websiteId}
                    sessionId={sessionId}
                    onSave={onClose}
                  />
                )}
                {onClose && (
                  <Button onClick={onClose} variant="ghost" aria-label={t(labels.close)}>
                    <Icon>
                      <X />
                    </Icon>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className={styles.body}>
            <aside className={styles.sidebar}>
              <SessionInfo data={data} layout="sidebar" showDistinctId={!singleDistinctId} />
            </aside>

            <div className={styles.main}>
              <SessionStats data={data} />

              <Tabs>
                <TabsList>
                  <TabsTrigger value="activity">
                    <span className={styles.tabLabel}>
                      <span>{t(labels.activity)}</span>
                      {activityCount !== undefined && (
                        <Badge variant="secondary" className={styles.tabBadge}>
                          {activityCount}
                        </Badge>
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="properties">
                    <span className={styles.tabLabel}>
                      <span>{t(labels.properties)}</span>
                      {propertiesCount !== undefined && (
                        <Badge variant="secondary" className={styles.tabBadge}>
                          {propertiesCount}
                        </Badge>
                      )}
                    </span>
                  </TabsTrigger>
                  {showReplays && <TabsTrigger value="replays">{t(labels.replays)}</TabsTrigger>}
                </TabsList>
                <TabsContent value="activity">
                  <SessionActivity
                    websiteId={websiteId}
                    sessionId={sessionId}
                    startDate={data?.firstAt}
                    endDate={data?.lastAt}
                    distinctId={data?.distinctId}
                  />
                </TabsContent>
                <TabsContent value="properties">
                  <SessionData sessionId={sessionId} websiteId={websiteId} />
                </TabsContent>
                {showReplays && (
                  <TabsContent
                    value="replays"
                    style={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}
                  >
                    <SessionReplaysDataTable websiteId={websiteId} sessionId={sessionId} />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </Column>
      )}
    </LoadingPanel>
  );
}
