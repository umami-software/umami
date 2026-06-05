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
import { useEffect, useState } from 'react';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages, useSubscription, useUpdateQuery, useWebsite } from '@/components/hooks';
import { Video } from '@/components/icons';
import { getRecorderConfig, type RecorderConfig } from '@/lib/recorder';

const RECORDER_NAME = 'recorder.js';

export function WebsiteReplaySettings({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages } = useMessages();
  const { hasFeature, cloudMode } = useSubscription(website?.teamId);
  const { mutateAsync, touch, toast, isPending } = useUpdateQuery(`/websites/${websiteId}`);
  const config = getRecorderConfig(website?.replayConfig);

  const [replayEnabled, setReplayEnabled] = useState(config.replayEnabled === true);
  const [heatmapEnabled, setHeatmapEnabled] = useState(config.heatmapEnabled === true);
  const [sampleRate, setSampleRate] = useState(config.sampleRate ?? 0.15);
  const [heatmapSampleRate, setHeatmapSampleRate] = useState(config.heatmapSampleRate ?? 0.15);
  const [maskLevel, setMaskLevel] = useState(config.maskLevel ?? 'moderate');
  const [maxDuration, setMaxDuration] = useState(String(config.maxDuration ?? 300000));
  const [blockSelector, setBlockSelector] = useState(config.blockSelector ?? '');

  useEffect(() => {
    setReplayEnabled(config.replayEnabled === true);
    setHeatmapEnabled(config.heatmapEnabled === true);
    setSampleRate(config.sampleRate ?? 0.15);
    setHeatmapSampleRate(config.heatmapSampleRate ?? 0.15);
    setMaskLevel(config.maskLevel ?? 'moderate');
    setMaxDuration(String(config.maxDuration ?? 300000));
    setBlockSelector(config.blockSelector ?? '');
  }, [
    config.blockSelector,
    config.heatmapEnabled,
    config.heatmapSampleRate,
    config.maskLevel,
    config.maxDuration,
    config.replayEnabled,
    config.sampleRate,
  ]);

  const recorderUrl = cloudMode
    ? `${process.env.cloudUrl}/${RECORDER_NAME}`
    : `${window?.location?.origin || ''}${process.env.basePath || ''}/${RECORDER_NAME}`;

  const recorderCode = `<script defer src="${recorderUrl}" data-website-id="${websiteId}"></script>`;
  const sectionLabel = `${t(labels.replays)} & ${t(labels.heatmaps)}`;

  const saveRecorderConfig = async (nextConfig: RecorderConfig, rollback?: () => void) => {
    try {
      await mutateAsync(
        {
          replayConfig: nextConfig,
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
      rollback?.();
    }
  };

  const getNextConfig = (overrides: Partial<RecorderConfig> = {}): RecorderConfig => ({
    ...config,
    replayEnabled,
    heatmapEnabled,
    sampleRate,
    heatmapSampleRate,
    maskLevel,
    maxDuration: parseInt(maxDuration, 10) || 300000,
    blockSelector,
    ...overrides,
  });

  const handleReplayToggle = async (value: boolean) => {
    const previous = replayEnabled;

    setReplayEnabled(value);
    await saveRecorderConfig(getNextConfig({ replayEnabled: value }), () =>
      setReplayEnabled(previous),
    );
  };

  const handleHeatmapToggle = async (value: boolean) => {
    const previous = heatmapEnabled;

    setHeatmapEnabled(value);
    await saveRecorderConfig(getNextConfig({ heatmapEnabled: value }), () =>
      setHeatmapEnabled(previous),
    );
  };

  const handleSave = async () => {
    await saveRecorderConfig(getNextConfig());
  };

  if (cloudMode && !hasFeature('replays')) {
    return (
      <Column gap="4">
        <Label>{sectionLabel}</Label>
        <EmptyPlaceholder
          icon={<Video />}
          title={t(messages.upgradeRequired, { plan: 'Business' })}
          description="Watch real user sessions and build heatmaps from real visitor behavior."
        >
          <Button
            variant="primary"
            onPress={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}
          >
            {t(labels.upgrade)}
          </Button>
        </EmptyPlaceholder>
      </Column>
    );
  }

  return (
    <Column gap="4">
      <Label>{sectionLabel}</Label>
      <Switch isSelected={replayEnabled} onChange={handleReplayToggle} isDisabled={isPending}>
        {t(labels.replays)}
      </Switch>
      <Switch isSelected={heatmapEnabled} onChange={handleHeatmapToggle} isDisabled={isPending}>
        {t(labels.heatmaps)}
      </Switch>
      {(replayEnabled || heatmapEnabled) && (
        <>
          <Label>{t(labels.recorderCode)}</Label>
          <Text color="muted">{t(messages.trackingCode)}</Text>
          <TextField
            value={recorderCode}
            isReadOnly
            allowCopy
            asTextArea
            resize="none"
            className="code-textarea"
          />
          {heatmapEnabled && (
            <Slider
              label={`Heatmap ${t(labels.sampleRate).toLowerCase()}`}
              minValue={0.05}
              maxValue={1}
              step={0.05}
              value={heatmapSampleRate}
              onChange={v => setHeatmapSampleRate(Array.isArray(v) ? v[0] : v)}
              showValue
              formatOptions={{ style: 'percent', maximumFractionDigits: 0 }}
              style={{ maxWidth: '360px' }}
            />
          )}
          {replayEnabled && (
            <>
              <Slider
                label={`Replay ${t(labels.sampleRate).toLowerCase()}`}
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
            </>
          )}
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
