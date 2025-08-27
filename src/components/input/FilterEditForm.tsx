import { useState } from 'react';
import { Column, Tabs, TabList, Tab, TabPanel, Row, Button } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { FieldFilters } from '@/components/input/FieldFilters';
import { SegmentFilters } from '@/components/input/SegmentFilters';

export interface FilterEditFormProps {
  websiteId?: string;
  filters: any[];
  segmentId?: string;
  onChange?: (params: { filters: any[]; segment: any }) => void;
  onClose?: () => void;
}

export function FilterEditForm({
  websiteId,
  filters = [],
  segmentId,
  onChange,
  onClose,
}: FilterEditFormProps) {
  const { formatMessage, labels } = useMessages();
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [currentSegment, setCurrentSegment] = useState(segmentId);

  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  const handleReset = () => {
    setCurrentFilters([]);
    setCurrentSegment(null);
  };

  const handleSave = () => {
    onChange?.({ filters: currentFilters.filter(f => f.value), segment: currentSegment });
    onClose?.();
  };

  const handleSegmentChange = (id: string) => {
    setCurrentSegment(id);
  };

  return (
    <Column>
      <Tabs>
        <TabList>
          <Tab id="fields">{formatMessage(labels.fields)}</Tab>
          <Tab id="segments">{formatMessage(labels.segments)}</Tab>
        </TabList>
        <TabPanel id="fields">
          <FieldFilters
            websiteId={websiteId}
            value={currentFilters}
            startDate={startDate}
            endDate={endDate}
            onSave={setCurrentFilters}
          />
        </TabPanel>
        <TabPanel id="segments" style={{ height: 400 }}>
          <SegmentFilters
            websiteId={websiteId}
            segmentId={currentSegment}
            onSave={handleSegmentChange}
          />
        </TabPanel>
      </Tabs>
      <Row alignItems="center" justifyContent="space-between" gridColumn="span 2" marginTop="6" gap>
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
