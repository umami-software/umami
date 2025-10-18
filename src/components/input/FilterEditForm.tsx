import { useFilters, useMessages, useMobile, useNavigation } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { SegmentFilters } from '@/components/input/SegmentFilters';
import { Button, Column, Row, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { useState } from 'react';

export interface FilterEditFormProps {
  websiteId?: string;
  onChange?: (params: { filters: any[]; segment?: string; cohort?: string }) => void;
  onClose?: () => void;
}

export function FilterEditForm({ websiteId, onChange, onClose }: FilterEditFormProps) {
  const {
    query: { segment, cohort },
    pathname,
  } = useNavigation();
  const { filters } = useFilters();
  const { formatMessage, labels } = useMessages();
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [currentSegment, setCurrentSegment] = useState(segment);
  const [currentCohort, setCurrentCohort] = useState(cohort);
  const { isMobile } = useMobile();
  const excludeFilters = pathname.includes('/pixels') || pathname.includes('/links');

  const handleReset = () => {
    setCurrentFilters([]);
    setCurrentSegment(undefined);
    setCurrentCohort(undefined);
  };

  const handleSave = () => {
    onChange?.({
      filters: currentFilters.filter(f => f.value),
      segment: currentSegment,
      cohort: currentCohort,
    });
    onClose?.();
  };

  const handleSegmentChange = (id: string, type: string) => {
    setCurrentSegment(type === 'segment' ? id : undefined);
    setCurrentCohort(type === 'cohort' ? id : undefined);
  };

  return (
    <Column width={isMobile ? 'auto' : '800px'} gap="6">
      <Column minHeight="500px">
        <Tabs>
          <TabList>
            <Tab id="fields">{formatMessage(labels.fields)}</Tab>
            {!excludeFilters && (
              <>
                <Tab id="segments">{formatMessage(labels.segments)}</Tab>
                <Tab id="cohorts">{formatMessage(labels.cohorts)}</Tab>
              </>
            )}
          </TabList>
          <TabPanel id="fields">
            <FieldFilters
              websiteId={websiteId}
              value={currentFilters}
              onChange={setCurrentFilters}
              exclude={excludeFilters ? ['path', 'title', 'hostname', 'tag', 'event'] : []}
            />
          </TabPanel>
          <TabPanel id="segments">
            <SegmentFilters
              websiteId={websiteId}
              segmentId={currentSegment}
              onChange={handleSegmentChange}
            />
          </TabPanel>
          <TabPanel id="cohorts">
            <SegmentFilters
              type="cohort"
              websiteId={websiteId}
              segmentId={currentCohort}
              onChange={handleSegmentChange}
            />
          </TabPanel>
        </Tabs>
      </Column>
      <Row alignItems="center" justifyContent="space-between" gap>
        <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
        <Row alignItems="center" justifyContent="flex-end" gridColumn="span 2" gap>
          <Button onPress={onClose}>{formatMessage(labels.cancel)}</Button>
          <Button variant="primary" onPress={handleSave}>
            {formatMessage(labels.apply)}
          </Button>
        </Row>
      </Row>
    </Column>
  );
}
