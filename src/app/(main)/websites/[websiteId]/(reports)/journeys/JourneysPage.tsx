'use client';
import { useState } from 'react';
import { ListItem, Select, Column, Grid, SearchField } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { Journey } from './Journey';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

const JOURNEY_STEPS = [2, 3, 4, 5, 6, 7];
const DEFAULT_STEP = 3;

export function JourneysPage({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const [steps, setSteps] = useState(DEFAULT_STEP);
  const [startStep, setStartStep] = useState('');
  const [endStep, setEndStep] = useState('');

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
      <Panel height="900px" allowFullscreen>
        <Journey
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          steps={steps}
          startStep={startStep}
          endStep={endStep}
        />
      </Panel>
    </Column>
  );
}
