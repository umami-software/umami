'use client';
import { Column, Row } from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { WebsiteValueComboBox } from '@/components/input/WebsiteValueComboBox';
import { useDateRange, useMessages, useTimezone } from '@/components/hooks';
import { FeatureAdoption } from './FeatureAdoption';

export function FeatureAdoptionPage({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange({ timezone });
  const [feature, setFeature] = useState('');
  const [successEvent, setSuccessEvent] = useState('');

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Row gap>
        <WebsiteValueComboBox
          websiteId={websiteId}
          type="event"
          startDate={startDate}
          endDate={endDate}
          value={feature}
          onChange={setFeature}
          label={t(labels.event)}
        />
        <WebsiteValueComboBox
          websiteId={websiteId}
          type="event"
          startDate={startDate}
          endDate={endDate}
          value={successEvent}
          onChange={setSuccessEvent}
          label={t(labels.successEvent)}
        />
      </Row>
      <FeatureAdoption
        websiteId={websiteId}
        feature={feature}
        successEvent={successEvent || undefined}
      />
    </Column>
  );
}
