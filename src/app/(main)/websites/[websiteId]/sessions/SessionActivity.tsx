import { Button, Icon, Popover, PopoverContent, PopoverTrigger, Row } from '@umami/react-zen';
import { isSameDay } from 'date-fns';
import { useMemo } from 'react';
import { Empty } from '@/components/common/Empty';
import { Favicon } from '@/components/common/Favicon';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useSessionActivityQuery, useTimezone } from '@/components/hooks';
import { Eye, FileText } from '@/components/icons';
import { EventData } from '@/components/metrics/EventData';
import { Lightning } from '@/components/svg';
import { decodePunycodeDomain, formatShortTime } from '@/lib/format';
import styles from './SessionActivity.module.css';

interface ActivityEvent {
  eventId: string;
  createdAt: string;
  urlPath: string;
  urlQuery?: string;
  referrerDomain?: string;
  eventName?: string;
  visitId?: string;
  hostname?: string;
  hasData?: number | boolean;
}

interface VisitGroup {
  key: string;
  visitId: string;
  visitNumber: number;
  color: string;
  events: ActivityEvent[];
  referrerDomain?: string;
  durationSeconds: number;
}

interface DayGroup {
  key: string;
  label: string;
  visits: VisitGroup[];
}

export function SessionActivity({
  websiteId,
  sessionId,
  startDate,
  endDate,
  distinctId,
}: {
  websiteId: string;
  sessionId: string;
  startDate: Date;
  endDate: Date;
  distinctId?: string;
}) {
  const { t, labels } = useMessages();
  const { formatTimezoneDate } = useTimezone();
  const { data, isLoading, error } = useSessionActivityQuery(
    websiteId,
    sessionId,
    startDate,
    endDate,
    distinctId,
  );

  const { dayGroups, hasMultipleHostnames, totalVisits } = useMemo(() => {
    const rows: ActivityEvent[] = Array.isArray(data) ? data : [];

    if (!rows.length) {
      return { dayGroups: [] as DayGroup[], hasMultipleHostnames: false, totalVisits: 0 };
    }

    const hostnames = new Set(rows.map(row => row.hostname).filter(Boolean));

    // Assign chronological visit numbers (1 = earliest visit) since rows arrive newest-first.
    const visitNumbers = new Map<string, number>();
    let nextVisitNumber = 1;
    for (let i = rows.length - 1; i >= 0; i--) {
      const id = rows[i].visitId || 'default';
      if (!visitNumbers.has(id)) {
        visitNumbers.set(id, nextVisitNumber++);
      }
    }

    const groups: DayGroup[] = [];
    let currentDay: DayGroup | null = null;
    let lastDate: Date | null = null;

    for (const row of rows) {
      const rowDate = new Date(row.createdAt);
      const isNewDay = !lastDate || !isSameDay(lastDate, rowDate);
      lastDate = rowDate;

      if (isNewDay || !currentDay) {
        currentDay = {
          key: `${formatTimezoneDate(row.createdAt, 'yyyy-MM-dd')}-${groups.length}`,
          label: formatTimezoneDate(row.createdAt, 'PPPP'),
          visits: [],
        };
        groups.push(currentDay);
      }

      const visitId = row.visitId || 'default';
      const lastVisit = currentDay.visits[currentDay.visits.length - 1];

      if (!lastVisit || lastVisit.visitId !== visitId) {
        currentDay.visits.push({
          key: `${visitId}-${currentDay.visits.length}`,
          visitId,
          visitNumber: visitNumbers.get(visitId) ?? 1,
          color: row.visitId ? `#${row.visitId.substring(0, 6)}` : 'var(--primary)',
          events: [row],
          referrerDomain: row.referrerDomain || undefined,
          durationSeconds: 0,
        });
      } else {
        lastVisit.events.push(row);
        if (row.referrerDomain) {
          lastVisit.referrerDomain = row.referrerDomain;
        }
      }
    }

    for (const day of groups) {
      for (const visit of day.visits) {
        const newest = new Date(visit.events[0].createdAt).getTime();
        const oldest = new Date(visit.events[visit.events.length - 1].createdAt).getTime();
        visit.durationSeconds = Math.max(0, Math.round((newest - oldest) / 1000));
      }
    }

    return {
      dayGroups: groups,
      hasMultipleHostnames: hostnames.size > 1,
      totalVisits: visitNumbers.size,
    };
  }, [data, formatTimezoneDate]);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {!dayGroups.length ? (
        <Empty />
      ) : (
        <div className={styles.root}>
          {dayGroups.map(day => (
            <div key={day.key} className={styles.dayGroup}>
              <div className={styles.dayHeader}>{day.label}</div>
              {day.visits.map(visit => {
                const showVisitHeader =
                  totalVisits > 1 || visit.events.length > 1 || Boolean(visit.referrerDomain);
                const durationLabel =
                  visit.durationSeconds > 0
                    ? formatShortTime(visit.durationSeconds, ['h', 'm', 's'], ' ').trim()
                    : '';

                return (
                  <div key={visit.key} className={styles.visitGroup}>
                    {showVisitHeader && (
                      <div className={styles.visitHeader}>
                        <span
                          className={styles.visitDot}
                          style={{ backgroundColor: visit.color }}
                        />
                        <span className={styles.visitTitle}>
                          {totalVisits > 1 ? `Visit ${visit.visitNumber}` : t(labels.session)}
                        </span>
                        <span className={styles.visitMeta}>
                          <span>·</span>
                          <span>
                            {visit.events.length}{' '}
                            {visit.events.length === 1 ? t(labels.event) : t(labels.events)}
                          </span>
                          {durationLabel && (
                            <>
                              <span>·</span>
                              <span>{durationLabel}</span>
                            </>
                          )}
                        </span>
                        {visit.referrerDomain && (
                          <span className={styles.visitReferrer} title={visit.referrerDomain}>
                            <Favicon domain={visit.referrerDomain} />
                            <span>{decodePunycodeDomain(visit.referrerDomain)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.timeline}>
                      {visit.events.map((event, index) => {
                        const isFirst = index === 0;
                        const isLast = index === visit.events.length - 1;
                        const isOnly = visit.events.length === 1;
                        const prevEvent = visit.events[index + 1];
                        const deltaSeconds = prevEvent
                          ? Math.max(
                              0,
                              Math.round(
                                (new Date(event.createdAt).getTime() -
                                  new Date(prevEvent.createdAt).getTime()) /
                                  1000,
                              ),
                            )
                          : 0;
                        const deltaLabel =
                          deltaSeconds > 0
                            ? `+${formatShortTime(deltaSeconds, ['h', 'm', 's'], ' ').trim()}`
                            : '';

                        const isCustomEvent = Boolean(event.eventName);
                        const fullPath = event.urlQuery
                          ? `${event.urlPath}?${event.urlQuery}`
                          : event.urlPath;

                        const itemClass = [
                          styles.item,
                          isOnly
                            ? styles.itemOnly
                            : isFirst
                              ? styles.itemFirst
                              : isLast
                                ? styles.itemLast
                                : '',
                        ]
                          .filter(Boolean)
                          .join(' ');

                        return (
                          <div
                            key={event.eventId}
                            className={itemClass}
                            style={{ ['--visit-color' as string]: visit.color }}
                          >
                            <div
                              className={styles.timeCol}
                              title={formatTimezoneDate(event.createdAt, 'PPPpp')}
                            >
                              {formatTimezoneDate(event.createdAt, 'pp')}
                            </div>

                            <div className={styles.railCol}>
                              <span
                                className={
                                  isCustomEvent ? `${styles.node} ${styles.nodeEvent}` : styles.node
                                }
                              />
                            </div>

                            <div className={styles.contentCol}>
                              <span
                                className={
                                  isCustomEvent
                                    ? `${styles.actionIcon} ${styles.actionIconEvent}`
                                    : styles.actionIcon
                                }
                              >
                                <Icon size="sm">{isCustomEvent ? <Lightning /> : <Eye />}</Icon>
                              </span>

                              <span className={styles.verb}>
                                {isCustomEvent ? t(labels.triggeredEvent) : t(labels.viewedPage)}
                              </span>

                              <span className={styles.target}>
                                {!isCustomEvent && hasMultipleHostnames && event.hostname && (
                                  <span className={styles.hostname}>
                                    {decodePunycodeDomain(event.hostname)}
                                  </span>
                                )}
                                {isCustomEvent ? (
                                  <span className={styles.eventTarget} title={event.eventName}>
                                    {event.eventName}
                                  </span>
                                ) : (
                                  <a
                                    className={styles.pathLink}
                                    href={`//${event.hostname}${fullPath}`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    title={fullPath}
                                  >
                                    {event.urlPath}
                                  </a>
                                )}
                              </span>

                              {deltaLabel && <span className={styles.delta}>{deltaLabel}</span>}

                              {Boolean(event.hasData) && (
                                <PropertiesButton websiteId={websiteId} eventId={event.eventId} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </LoadingPanel>
  );
}

const PropertiesButton = props => {
  return (
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="ghost" />}>
        <Row alignItems="center" gap>
          <Icon size="sm">
            <FileText />
          </Icon>
        </Row>
      </PopoverTrigger>
      <PopoverContent side="right" sideOffset={8} style={{ width: 'auto' }}>
        <EventData {...props} />
      </PopoverContent>
    </Popover>
  );
};
