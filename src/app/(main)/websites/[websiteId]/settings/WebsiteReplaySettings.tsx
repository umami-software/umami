import {
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Label,
  Switch,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useUpdateQuery, useWebsite } from '@/components/hooks';

interface ReplayConfig {
  sampleRate?: number;
  maskLevel?: string;
  maxDuration?: number;
  blockSelector?: string;
  retentionDays?: number;
}

export function WebsiteReplaySettings({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages } = useMessages();
  const { mutateAsync, touch, toast } = useUpdateQuery(`/websites/${websiteId}`);
  const [enabled, setEnabled] = useState(website?.replayEnabled ?? false);

  const config = (website?.replayConfig as ReplayConfig) || {};

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      {
        replayEnabled: enabled,
        replayConfig: {
          sampleRate: parseFloat(data.sampleRate) || 1,
          maskLevel: data.maskLevel || 'moderate',
          maxDuration: parseInt(data.maxDuration, 10) || 600000,
          blockSelector: data.blockSelector || '',
          retentionDays: parseInt(data.retentionDays, 10) || 30,
        },
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('websites');
          touch(`website:${website.id}`);
        },
      },
    );
  };

  return (
    <Form
      onSubmit={handleSubmit}
      values={{
        sampleRate: String(config.sampleRate ?? 1),
        maskLevel: config.maskLevel ?? 'moderate',
        maxDuration: String(config.maxDuration ?? 600000),
        blockSelector: config.blockSelector ?? '',
        retentionDays: String(config.retentionDays ?? 30),
      }}
    >
      <Column gap="4">
        <Label>{t(labels.replays)}</Label>
        <Switch isSelected={enabled} onChange={setEnabled}>
          {t(labels.replayEnabled)}
        </Switch>
        {enabled && (
          <>
            <FormField name="sampleRate" label={t(labels.sampleRate)}>
              <TextField />
            </FormField>
            <FormField
              name="maskLevel"
              label={`${t(labels.maskLevel)} (strict / moderate / relaxed)`}
            >
              <TextField />
            </FormField>
            <FormField name="maxDuration" label={`${t(labels.maxDuration)} (ms)`}>
              <TextField />
            </FormField>
            <FormField name="blockSelector" label={t(labels.blockSelector)}>
              <TextField />
            </FormField>
            <FormField name="retentionDays" label={t(labels.retentionDays)}>
              <TextField />
            </FormField>
          </>
        )}
      </Column>
      <FormButtons>
        <FormSubmitButton variant="primary">{t(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
