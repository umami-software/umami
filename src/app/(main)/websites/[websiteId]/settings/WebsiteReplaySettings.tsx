import {
  Button,
  Column,
  Label,
  ListItem,
  Row,
  Select,
  Slider,
  Switch,
  Text,
  TextField,
} from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useSubscription, useUpdateQuery, useWebsite } from '@/components/hooks';

interface ReplayConfig {
  sampleRate?: number;
  maskLevel?: string;
  maxDuration?: number;
  blockSelector?: string;
}

export function WebsiteReplaySettings({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages } = useMessages();
  const { hasFeature, cloudMode } = useSubscription();
  const { mutateAsync, touch, toast, isPending } = useUpdateQuery(`/websites/${websiteId}`);
  const [enabled, setEnabled] = useState(website?.replayEnabled ?? false);

  const config = (website?.replayConfig as ReplayConfig) || {};

  const [sampleRate, setSampleRate] = useState(config.sampleRate ?? 0.15);
  const [maskLevel, setMaskLevel] = useState(config.maskLevel ?? 'moderate');
  const [maxDuration, setMaxDuration] = useState(String(config.maxDuration ?? 300000));
  const [blockSelector, setBlockSelector] = useState(config.blockSelector ?? '');

  const handleToggle = async (value: boolean) => {
    const previous = enabled;
    setEnabled(value);

    try {
      await mutateAsync(
        {
          replayEnabled: value,
        },
        {
          onSuccess: async () => {
            toast(t(messages.saved));
            touch('websites');
            touch(`website:${websiteId}`);
          },
        },
      );
    } catch {
      setEnabled(previous);
    }
  };

  const handleSave = async () => {
    await mutateAsync(
      {
        replayEnabled: enabled,
        replayConfig: {
          sampleRate,
          maskLevel,
          maxDuration: parseInt(maxDuration, 10) || 300000,
          ...(blockSelector && { blockSelector }),
        },
      },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch('websites');
          touch(`website:${websiteId}`);
        },
      },
    );
  };

  if (cloudMode && !hasFeature('replays')) {
    return (
      <Column gap="4">
        <Label>{t(labels.replays)}</Label>
        <Column gap="4" alignItems="center" padding="10">
          <Text>{t(messages.upgradeRequired, { plan: 'Business' })}</Text>
          <Button variant="primary" onPress={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}>
            {t(labels.upgrade)}
          </Button>
        </Column>
      </Column>
    );
  }

  return (
    <Column gap="4">
      <Label>{t(labels.replays)}</Label>
      <Switch isSelected={enabled} onChange={handleToggle} isDisabled={isPending}>
        {t(labels.replayEnabled)}
      </Switch>
      {enabled && (
        <>
          <Slider
            label={t(labels.sampleRate)}
            minValue={0.05}
            maxValue={1}
            step={0.05}
            value={sampleRate}
            onChange={v => setSampleRate(Array.isArray(v) ? v[0] : v)}
            showValue
            formatOptions={{ style: 'percent', maximumFractionDigits: 0 }}
            style={{ maxWidth: '360px' }}
          />
          <Column gap="1">
            <Label>{t(labels.maskLevel)}</Label>
            <Select value={maskLevel} onChange={setMaskLevel} style={{ maxWidth: '360px' }}>
              <ListItem id="strict">strict</ListItem>
              <ListItem id="moderate">moderate</ListItem>
            </Select>
          </Column>
          <Column gap="1">
            <Label>{t(labels.maxDuration)}</Label>
            <Select value={maxDuration} onChange={setMaxDuration} style={{ maxWidth: '360px' }}>
              <ListItem id="300000">5 minutes</ListItem>
              <ListItem id="600000">10 minutes</ListItem>
              <ListItem id="900000">15 minutes</ListItem>
              <ListItem id="1200000">20 minutes</ListItem>
            </Select>
          </Column>
          <Column gap="1">
            <Label>{t(labels.blockSelector)}</Label>
            <TextField value={blockSelector} onChange={setBlockSelector} />
          </Column>
          <Row>
            <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
              {t(labels.save)}
            </Button>
          </Row>
        </>
      )}
    </Column>
  );
}
