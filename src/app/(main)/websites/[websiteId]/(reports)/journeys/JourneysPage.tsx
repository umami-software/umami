'use client';
import { Column, Grid, ListItem, Row, SearchField, Select } from '@umami/react-zen';
import { FilterButtons } from 'dist';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages } from '@/components/hooks';
import { Journey } from './Journey';

const JOURNEY_STEPS = [2, 3, 4, 5, 6, 7];
const DEFAULT_STEP = 3;

export function JourneysPage({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const [view, setView] = useState('all');
  const [steps, setSteps] = useState(DEFAULT_STEP);
  const [startStep, setStartStep] = useState('');
  const [endStep, setEndStep] = useState('');

  const buttons = [
    {
      id: 'all',
      label: formatMessage(labels.all),
    },
    {
      id: 'views',
      label: formatMessage(labels.views),
    },
    {
      id: 'events',
      label: formatMessage(labels.events),
    },
  ];

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Grid columns="repeat(3, 1fr)" gap>
        <Select
          items={JOURNEY_STEPS}
          label={formatMessage(labels.steps)}
          value={steps}
          defaultValue={steps}
          onChange={setSteps}
        >
          {JOURNEY_STEPS.map(step => (
            <ListItem key={step} id={step}>
              {step}
            </ListItem>
          ))}
        </Select>
        <Column>
          <SearchField
            label={formatMessage(labels.startStep)}
            value={startStep}
            onSearch={setStartStep}
            delay={1000}
          />
        </Column>
        <Column>
          <SearchField
            label={formatMessage(labels.endStep)}
            value={endStep}
            onSearch={setEndStep}
            delay={1000}
          />
        </Column>
      </Grid>
      <Row justifyContent="flex-end">
        <FilterButtons items={buttons} value={view} onChange={setView} />
      </Row>
      <Panel height="900px" allowFullscreen>
        <Journey
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          steps={steps}
          startStep={startStep}
          endStep={endStep}
          view={view}
        />
      </Panel>
    </Column>
  );
}
