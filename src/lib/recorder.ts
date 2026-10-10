export interface RecorderConfig {
  replayEnabled?: boolean;
  heatmapEnabled?: boolean;
  sampleRate?: number;
  heatmapSampleRate?: number;
  maskLevel?: 'strict' | 'moderate';
  maxDuration?: number;
  blockSelector?: string;
}

export function getRecorderConfig(value: unknown): RecorderConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const config = value as Record<string, unknown>;
  const nextConfig: RecorderConfig = {};

  if (config.replayEnabled === true) {
    nextConfig.replayEnabled = true;
  }

  if (config.heatmapEnabled === true) {
    nextConfig.heatmapEnabled = true;
  }

  if (typeof config.sampleRate === 'number') {
    nextConfig.sampleRate = config.sampleRate;
  }

  if (typeof config.heatmapSampleRate === 'number') {
    nextConfig.heatmapSampleRate = config.heatmapSampleRate;
  }

  if (config.maskLevel === 'strict' || config.maskLevel === 'moderate') {
    nextConfig.maskLevel = config.maskLevel;
  }

  if (typeof config.maxDuration === 'number' && Number.isFinite(config.maxDuration)) {
    nextConfig.maxDuration = Math.round(config.maxDuration);
  }

  if (typeof config.blockSelector === 'string') {
    nextConfig.blockSelector = config.blockSelector;
  }

  return nextConfig;
}

export function getRecorderEnabled(config: unknown) {
  const { replayEnabled, heatmapEnabled } = getRecorderConfig(config);

  return replayEnabled === true || heatmapEnabled === true;
}
