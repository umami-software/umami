'use client';
import { Column, Grid, ListItem, Select } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Empty } from '@/components/common/Empty';
import { useDateRange, useMessages, useWebsiteValuesQuery } from '@/components/hooks';
import { Attribution } from './Attribution';

const stepPlaceholder = 'Select an item';

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
  const stepItems = useMemo(() => {
    if (!step || items.some(({ value }) => value === step)) {
      return items;
    }

    return [{ value: step }, ...items];
  }, [items, step]);

  const handleTypeChange = (value: any) => {
    setType(value as string);
    setStep('');
    setSearch('');
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
          <Select
            label={t(labels.conversionStep)}
            value={step}
            onChange={value => setStep(value?.toString() ?? '')}
            placeholder={stepPlaceholder}
            renderValue={({ defaultChildren }) => (step ? defaultChildren : stepPlaceholder)}
            isLoading={isLoading}
            searchValue={search}
            onSearch={setSearch}
            maxHeight={320}
            allowSearch
          >
            {stepItems.map(({ value }) => (
              <ListItem key={value} id={value}>
                {value}
              </ListItem>
            ))}
          </Select>
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
