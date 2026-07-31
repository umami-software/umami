'use client';
import { Column, Grid, Label, ListItem, Loading, Select } from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Empty } from '@/components/common/Empty';
import { MultiSelect, MultiSelectItem } from '@/components/common/MultiSelect';
import { useDateRange, useMessages, useWebsiteValuesQuery } from '@/components/hooks';
import { Attribution } from './Attribution';

export function AttributionPage({ websiteId }: { websiteId: string }) {
  const [model, setModel] = useState('first-click');
  const [type, setType] = useState('path');
  const [step, setStep] = useState('');
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const { data, isLoading } = useWebsiteValuesQuery({
    websiteId,
    type,
    search,
    startDate,
    endDate,
  });
  const items = data?.filter(({ value }) => value) || [];

  const handleTypeChange = (value: any) => {
    setType(value as string);
    setStep('');
    setSearch('');
  };

  const handleStepChange = (values: string[]) => {
    setStep(values.filter(value => value !== step).pop() ?? '');
  };

  return (
    <Column gap="6">
      <WebsiteControls websiteId={websiteId} />
      <Grid columns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap>
        <Column>
          <Select
            label={t(labels.model)}
            value={model}
            defaultValue={model}
            onChange={value => setModel(value as string)}
          >
            <ListItem id="first-click">{t(labels.firstClick)}</ListItem>
            <ListItem id="last-click">{t(labels.lastClick)}</ListItem>
          </Select>
        </Column>
        <Column>
          <Select
            label={t(labels.type)}
            value={type}
            defaultValue={type}
            onChange={handleTypeChange}
          >
            <ListItem id="path">{t(labels.viewedPage)}</ListItem>
            <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
          </Select>
        </Column>
        <Column>
          <Label>{t(labels.conversionStep)}</Label>
          <MultiSelect
            value={step ? [step] : []}
            onChange={handleStepChange}
            searchValue={search}
            onSearch={setSearch}
            renderEmptyState={() => (isLoading ? <Loading icon="dots" /> : <Empty />)}
            allowSearch
          >
            {items.map(({ value }) => (
              <MultiSelectItem key={value} value={value}>
                {value}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </Column>
      </Grid>
      {step ? (
        <Attribution
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          model={model}
          type={type}
          step={step}
        />
      ) : (
        <Empty />
      )}
    </Column>
  );
}
