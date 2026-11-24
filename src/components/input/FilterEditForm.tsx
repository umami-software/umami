import { Button, Column, Row, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
import { useState } from 'react';
import { useFilters, useMessages, useMobile, useNavigation } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { SegmentFilters } from '@/components/input/SegmentFilters';
import { PropertyFilters } from '@/components/property-data/PropertyFilters';
import type { EventPropertyFilter, SessionPropertyFilter } from '@/lib/types';

export interface FilterEditFormProps {
  websiteId?: string;
  onChange?: (params: {
    filters: any[];
    eventPropertyFilters: EventPropertyFilter[];
    sessionPropertyFilters: SessionPropertyFilter[];
    segment?: string;
    cohort?: string;
    match?: string;
  }) => void;
  onClose?: () => void;
}

export function FilterEditForm({ websiteId, onChange, onClose }: FilterEditFormProps) {
  const {
    query: { segment, cohort, match },
    pathname,
  } = useNavigation();
  const { filters, eventPropertyFilters, sessionPropertyFilters } = useFilters();
  const { t, labels } = useMessages();
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [currentEventPropertyFilters, setCurrentEventPropertyFilters] =
    useState(eventPropertyFilters);
  const [currentSessionPropertyFilters, setCurrentSessionPropertyFilters] =
    useState(sessionPropertyFilters);
  const [currentSegment, setCurrentSegment] = useState(segment);
  const [currentCohort, setCurrentCohort] = useState(cohort);
  const [currentMatch, setCurrentMatch] = useState<string>(match || 'all');
  const { isMobile } = useMobile();
  const isPixelLink = !websiteId || pathname.includes('/pixels') || pathname.includes('/links');
  const isEventsPath = pathname.endsWith('/events');
  const excludeEvent =
    !pathname.endsWith('/events') &&
    !pathname.endsWith('/replays') &&
    !pathname.endsWith('/heatmaps');
  const isPerformance = pathname.includes('/performance');

  const excludedFields = isPixelLink
    ? ['path', 'title', 'hostname', 'distinctId', 'tag', 'event']
    : isPerformance
      ? [
          'referrer',
          'query',
          'event',
          'tag',
          'distinctId',
          'utmSource',
          'utmMedium',
          'utmCampaign',
          'utmContent',
          'utmTerm',
        ]
      : excludeEvent
        ? ['event']
        : [];

  const handleReset = () => {
    setCurrentFilters([]);
    setCurrentEventPropertyFilters([]);
    setCurrentSessionPropertyFilters([]);
    setCurrentSegment(undefined);
    setCurrentCohort(undefined);
    setCurrentMatch('all');
  };

  const handleSave = () => {
    onChange?.({
      filters: currentFilters.filter(f => f.value),
      eventPropertyFilters: currentEventPropertyFilters.filter(f => f.value),
      sessionPropertyFilters: currentSessionPropertyFilters.filter(f => f.value),
      segment: currentSegment,
      cohort: currentCohort,
      match: currentMatch !== 'all' ? currentMatch : undefined,
    });
    onClose?.();
  };

  const handleSegmentChange = (id: string, type: string) => {
    setCurrentSegment(type === 'segment' ? id : undefined);
    setCurrentCohort(type === 'cohort' ? id : undefined);
  };

  const panelStyle = { overflowY: 'auto' as const, minHeight: 0 };
  const mobileTabListStyle = isMobile
    ? ({
        overflowX: 'auto',
        overflowY: 'hidden',
        flexWrap: 'nowrap',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      } as const)
    : undefined;
  const mobileTabStyle = isMobile
    ? ({ flex: '0 0 auto', whiteSpace: 'nowrap' } as const)
    : undefined;

  return (
    <Column width={isMobile ? 'auto' : '800px'} gap="6" style={{ flex: 1, minHeight: 0 }}>
      <Tabs
        style={{
          flex: 1,
          minHeight: 0,
          gridTemplateRows: 'auto 1fr',
          overflow: 'hidden',
        }}
      >
        <TabsList style={mobileTabListStyle}>
          <TabsTrigger value="fields" style={mobileTabStyle}>
            {t(labels.fields)}
          </TabsTrigger>
          {!isPixelLink && (
            <>
              <TabsTrigger value="segments" style={mobileTabStyle}>
                {t(labels.segments)}
              </TabsTrigger>
              <TabsTrigger value="cohorts" style={mobileTabStyle}>
                {t(labels.cohorts)}
              </TabsTrigger>
              {websiteId && isEventsPath && (
                <TabsTrigger value="event-properties" style={mobileTabStyle}>
                  {t(labels.eventProperties)}
                </TabsTrigger>
              )}
              {websiteId && (
                <TabsTrigger value="session-data" style={mobileTabStyle}>
                  {t(labels.sessionData)}
                </TabsTrigger>
              )}
            </>
          )}
        </TabsList>
        <TabsContent value="fields" style={panelStyle}>
          <FieldFilters
            websiteId={websiteId}
            value={currentFilters}
            match={currentMatch}
            onChange={setCurrentFilters}
            onMatchChange={setCurrentMatch}
            exclude={excludedFields}
          />
        </TabsContent>
        {!isPixelLink && websiteId && (
          <TabsContent value="segments" style={panelStyle}>
            <SegmentFilters
              websiteId={websiteId}
              segmentId={currentSegment}
              onChange={handleSegmentChange}
            />
          </TabsContent>
        )}
        {!isPixelLink && websiteId && (
          <TabsContent value="cohorts" style={panelStyle}>
            <SegmentFilters
              type="cohort"
              websiteId={websiteId}
              segmentId={currentCohort}
              onChange={handleSegmentChange}
            />
          </TabsContent>
        )}
        {!isPixelLink && websiteId && isEventsPath && (
          <TabsContent value="event-properties" style={panelStyle}>
            <PropertyFilters
              source="event"
              websiteId={websiteId}
              value={currentEventPropertyFilters}
              onChange={setCurrentEventPropertyFilters}
            />
          </TabsContent>
        )}
        {!isPixelLink && websiteId && (
          <TabsContent value="session-data" style={panelStyle}>
            <PropertyFilters
              source="session"
              websiteId={websiteId}
              value={currentSessionPropertyFilters}
              onChange={setCurrentSessionPropertyFilters}
            />
          </TabsContent>
        )}
      </Tabs>
      <Row
        alignItems="center"
        justifyContent="space-between"
        gap
        style={isMobile ? { paddingBottom: '16px' } : undefined}
      >
        <Button variant="secondary" onClick={handleReset}>
          {t(labels.reset)}
        </Button>
        <Row alignItems="center" justifyContent="flex-end" gridColumn="span 2" gap>
          <Button variant="secondary" onClick={onClose}>
            {t(labels.cancel)}
          </Button>
          <Button onClick={handleSave}>{t(labels.apply)}</Button>
        </Row>
      </Row>
    </Column>
  );
}
