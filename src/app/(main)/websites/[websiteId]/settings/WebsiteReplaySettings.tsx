import {
  Button,
  Column,
  Field,
  FieldLabel,
  Label,
  Loading,
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useId, useState } from 'react';
import { EmptyPlaceholder } from '@/components/common/EmptyPlaceholder';
import { useMessages, useSubscription, useUpdateQuery, useWebsite } from '@/components/hooks';
import { Video } from '@/components/icons';
import { getRecorderConfig, type RecorderConfig } from '@/lib/recorder';

const RECORDER_NAME = 'recorder.js';

const MASK_LEVEL_ITEMS = [
  { value: 'strict', label: 'strict' },
  { value: 'moderate', label: 'moderate' },
];

const MAX_DURATION_ITEMS = [
  { value: '300000', label: '5 minutes' },
  { value: '600000', label: '10 minutes' },
  { value: '900000', label: '15 minutes' },
  { value: '1200000', label: '20 minutes' },
];

function SampleRateSlider({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const labelId = useId();

  return (
    <Column gap="2" style={{ maxWidth: '360px' }}>
      <Row justifyContent="space-between" alignItems="center">
        <Label id={labelId}>{label}</Label>
        <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value.toLocaleString()}
        </Text>
      </Row>
      <Slider
        aria-labelledby={labelId}
        min={0.05}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={v => onValueChange(Array.isArray(v) ? v[0] : v)}
      />
    </Column>
  );
}

export function WebsiteReplaySettings({ websiteId }: { websiteId: string }) {
  const website = useWebsite();
  const { t, labels, messages } = useMessages();
  const { hasFeature, cloudMode, isLoading } = useSubscription(website?.teamId);
  const { mutateAsync, touch, toast, isPending } = useUpdateQuery(`/websites/${websiteId}`);
  const replaySwitchId = useId();
  const heatmapSwitchId = useId();
  const maskLevelId = useId();
  const maxDurationId = useId();
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

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (cloudMode && !hasFeature('replays')) {
    return (
      <Column gap="4">
        <Label>{sectionLabel}</Label>
        <EmptyPlaceholder
          icon={<Video />}
          title={t(messages.upgradeRequired, { plan: 'Business' })}
          description="Watch real user sessions and build heatmaps from real visitor behavior."
        >
          <Button onClick={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}>
            {t(labels.upgrade)}
          </Button>
        </EmptyPlaceholder>
      </Column>
    );
  }

  return (
    <Column gap="4">
      <Label>{sectionLabel}</Label>
      <Field orientation="horizontal">
        <Switch
          id={replaySwitchId}
          checked={replayEnabled}
          onCheckedChange={handleReplayToggle}
          disabled={isPending}
        />
        <FieldLabel htmlFor={replaySwitchId}>{t(labels.replays)}</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id={heatmapSwitchId}
          checked={heatmapEnabled}
          onCheckedChange={handleHeatmapToggle}
          disabled={isPending}
        />
        <FieldLabel htmlFor={heatmapSwitchId}>{t(labels.heatmaps)}</FieldLabel>
      </Field>
      {(replayEnabled || heatmapEnabled) && (
        <>
          <Label>{t(labels.recorderCode)}</Label>
          <Text color="muted-foreground">{t(messages.trackingCode)}</Text>
          <TextField
            value={recorderCode}
            readOnly
            allowCopy
            asTextArea
            resize="none"
            className="code-textarea"
          />
          {heatmapEnabled && (
            <SampleRateSlider
              label={`Heatmap ${t(labels.sampleRate).toLowerCase()}`}
              value={heatmapSampleRate}
              onValueChange={setHeatmapSampleRate}
            />
          )}
          {replayEnabled && (
            <>
              <SampleRateSlider
                label={`Replay ${t(labels.sampleRate).toLowerCase()}`}
                value={sampleRate}
                onValueChange={setSampleRate}
              />
              <Field>
                <FieldLabel htmlFor={maskLevelId}>{t(labels.maskLevel)}</FieldLabel>
                <Select
                  items={MASK_LEVEL_ITEMS}
                  value={maskLevel}
                  onValueChange={v => setMaskLevel(v as typeof maskLevel)}
                >
                  <SelectTrigger id={maskLevelId} className="w-full" style={{ maxWidth: '360px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {MASK_LEVEL_ITEMS.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor={maxDurationId}>{t(labels.maxDuration)}</FieldLabel>
                <Select
                  items={MAX_DURATION_ITEMS}
                  value={maxDuration}
                  onValueChange={v => setMaxDuration(v as string)}
                >
                  <SelectTrigger
                    id={maxDurationId}
                    className="w-full"
                    style={{ maxWidth: '360px' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {MAX_DURATION_ITEMS.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <TextField
                label={t(labels.blockSelector)}
                value={blockSelector}
                onValueChange={setBlockSelector}
              />
            </>
          )}
          <Row justifyContent="flex-end">
            <Button onClick={handleSave} disabled={isPending}>
              {t(labels.save)}
            </Button>
          </Row>
        </>
      )}
    </Column>
  );
}
