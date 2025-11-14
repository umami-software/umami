'use client';
import { useState } from 'react';
import { Column, Grid, Select, ListItem, SearchField } from '@umami/react-zen';
import { Attribution } from './Attribution';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useMessages } from '@/components/hooks';

export function AttributionPage({ websiteId }: { websiteId: string }) {
  const [model, setModel] = useState('first-click');
  const [type, setType] = useState('path');
  const [step, setStep] = useState('/');
  const { formatMessage, labels } = useMessages();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();

  return (
    <Column gap="6">
      <WebsiteControls websiteId={websiteId} />
      <Grid columns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap>
        <Column>
          <Select
            label={formatMessage(labels.model)}
            value={model}
            defaultValue={model}
            onChange={setModel}
          >
            <ListItem id="first-click">{formatMessage(labels.firstClick)}</ListItem>
            <ListItem id="last-click">{formatMessage(labels.lastClick)}</ListItem>
          </Select>
        </Column>
        <Column>
          <Select
            label={formatMessage(labels.type)}
            value={type}
            defaultValue={type}
            onChange={setType}
          >
            <ListItem id="path">{formatMessage(labels.viewedPage)}</ListItem>
            <ListItem id="event">{formatMessage(labels.triggeredEvent)}</ListItem>
          </Select>
        </Column>
        <Column>
          <SearchField
            label={formatMessage(labels.conversionStep)}
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
