'use client';
import {
  Column,
  Field,
  FieldLabel,
  Grid,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Empty } from '@/components/common/Empty';
import { useDateRange, useMessages, useTimezone } from '@/components/hooks';
import { WebsiteValueComboBox } from '@/components/input/WebsiteValueComboBox';
import { Attribution } from './Attribution';

export function AttributionPage({ websiteId }: { websiteId: string }) {
  const [model, setModel] = useState('first-click');
  const [type, setType] = useState('path');
  const [step, setStep] = useState('');
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange({ timezone });
  const handleTypeChange = (value: any) => {
    setType(value as string);
    setStep('');
  };

  const modelItems = [
    { value: 'first-click', label: t(labels.firstClick) },
    { value: 'last-click', label: t(labels.lastClick) },
  ];

  const typeItems = [
    { value: 'path', label: t(labels.viewedPage) },
    { value: 'event', label: t(labels.triggeredEvent) },
  ];

  return (
    <Column gap="6">
      <WebsiteControls websiteId={websiteId} />
      <Grid columns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap>
        <Column>
          <Field>
            <FieldLabel>{t(labels.model)}</FieldLabel>
            <Select
              items={modelItems}
              value={model}
              onValueChange={value => setModel(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {modelItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Column>
        <Column>
          <Field>
            <FieldLabel>{t(labels.type)}</FieldLabel>
            <Select items={typeItems} value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {typeItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Column>
        <Column>
          <WebsiteValueComboBox
            label={t(labels.conversionStep)}
            websiteId={websiteId}
            type={type}
            startDate={startDate}
            endDate={endDate}
            value={step}
            onChange={setStep}
          />
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
