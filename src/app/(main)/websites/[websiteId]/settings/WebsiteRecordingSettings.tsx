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

interface RecordingConfig {
  sampleRate?: number;
  maskLevel?: string;
  maxDuration?: number;
  blockSelector?: string;
  retentionDays?: number;
}

export function WebsiteRecordingSettings({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { formatMessage, labels, messages } = useMessages();
  const { mutateAsync, error, touch, toast } = useUpdateQuery(`/websites/${websiteId}`);
  const [enabled, setEnabled] = useState(website?.recordingEnabled ?? false);

  const config = (website?.recordingConfig as RecordingConfig) || {};

  const handleSubmit = async (data: any) => {
    await mutateAsync(
      {
        recordingEnabled: enabled,
        recordingConfig: {
          sampleRate: parseFloat(data.sampleRate) || 1,
          maskLevel: data.maskLevel || 'moderate',
          maxDuration: parseInt(data.maxDuration, 10) || 600000,
          blockSelector: data.blockSelector || '',
          retentionDays: parseInt(data.retentionDays, 10) || 30,
        },
      },
      {
        onSuccess: async () => {
          toast(formatMessage(messages.saved));
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
        <Label>{formatMessage(labels.recordings)}</Label>
        <Switch isSelected={enabled} onChange={setEnabled}>
          {formatMessage(labels.recordingEnabled)}
        </Switch>
        {enabled && (
          <>
            <FormField name="sampleRate" label={formatMessage(labels.sampleRate)}>
              <TextField />
            </FormField>
            <FormField
              name="maskLevel"
              label={`${formatMessage(labels.maskLevel)} (strict / moderate / relaxed)`}
            >
              <TextField />
            </FormField>
            <FormField name="maxDuration" label={`${formatMessage(labels.maxDuration)} (ms)`}>
              <TextField />
            </FormField>
            <FormField name="blockSelector" label={formatMessage(labels.blockSelector)}>
              <TextField />
            </FormField>
            <FormField name="retentionDays" label={formatMessage(labels.retentionDays)}>
              <TextField />
            </FormField>
          </>
        )}
      </Column>
      <FormButtons>
        <FormSubmitButton variant="primary">{formatMessage(labels.save)}</FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
