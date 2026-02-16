'use client';
import { Column, Grid, ListItem, SearchField, Select } from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useMessages } from '@/components/hooks';
import { Attribution } from './Attribution';

export function AttributionPage({ websiteId }: { websiteId: string }) {
  const [model, setModel] = useState('first-click');
  const [type, setType] = useState('path');
  const [step, setStep] = useState('/');
  const { t, labels } = useMessages();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();

  return (
    <Column gap="6">
      <WebsiteControls websiteId={websiteId} />
      <Grid columns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap>
        <Column>
          <Select label={t(labels.model)} value={model} defaultValue={model} onChange={setModel}>
            <ListItem id="first-click">{t(labels.firstClick)}</ListItem>
            <ListItem id="last-click">{t(labels.lastClick)}</ListItem>
          </Select>
        </Column>
        <Column>
          <Select label={t(labels.type)} value={type} defaultValue={type} onChange={setType}>
            <ListItem id="path">{t(labels.viewedPage)}</ListItem>
            <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
          </Select>
        </Column>
        <Column>
          <SearchField
            label={t(labels.conversionStep)}
            value={step}
            defaultValue={step}
            onSearch={setStep}
            delay={1000}
          />
        </Column>
      </Grid>
      <Attribution
        websiteId={websiteId}
        startDate={startDate}
        endDate={endDate}
        model={model}
        type={type}
        step={step}
      />
    </Column>
  );
}
