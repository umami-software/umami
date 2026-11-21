export const RECORDER_MASK_LEVELS = ['lax', 'strict', 'moderate'] as const;
export const RECORDER_CONSOLE_LEVELS = ['none', 'error', 'warn', 'info', 'debug', 'all'] as const;
export const RECORDER_CANVAS_FPS_MIN = 1;
export const RECORDER_CANVAS_FPS_MAX = 60;

export type RecorderMaskLevel = (typeof RECORDER_MASK_LEVELS)[number];
export type RecorderConsoleLevel = (typeof RECORDER_CONSOLE_LEVELS)[number];

export interface RecorderConfig {
  replayEnabled?: boolean;
  heatmapEnabled?: boolean;
  sampleRate?: number;
  heatmapSampleRate?: number;
  maskLevel?: RecorderMaskLevel;
  consoleLevel?: RecorderConsoleLevel;
  maxDuration?: number;
  blockSelector?: string;
  recordCanvas?: boolean;
  canvasFps?: number;
  canvasQuality?: number;
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

  if (RECORDER_MASK_LEVELS.includes(config.maskLevel as RecorderMaskLevel)) {
    nextConfig.maskLevel = config.maskLevel as RecorderMaskLevel;
  }

  if (RECORDER_CONSOLE_LEVELS.includes(config.consoleLevel as RecorderConsoleLevel)) {
    nextConfig.consoleLevel = config.consoleLevel as RecorderConsoleLevel;
  }

  if (typeof config.maxDuration === 'number' && Number.isFinite(config.maxDuration)) {
    nextConfig.maxDuration = Math.round(config.maxDuration);
  }

  if (typeof config.blockSelector === 'string') {
    nextConfig.blockSelector = config.blockSelector;
  }

  if (typeof config.recordCanvas === 'boolean') {
    nextConfig.recordCanvas = config.recordCanvas;
  }

  if (typeof config.canvasFps === 'number' && Number.isFinite(config.canvasFps)) {
    nextConfig.canvasFps = Math.min(
      Math.max(Math.round(config.canvasFps), RECORDER_CANVAS_FPS_MIN),
      RECORDER_CANVAS_FPS_MAX,
    );
  }

  if (typeof config.canvasQuality === 'number' && Number.isFinite(config.canvasQuality)) {
    nextConfig.canvasQuality = Math.min(Math.max(config.canvasQuality, 0), 1);
  }

  return nextConfig;
}

export function getRecorderEnabled(config: unknown) {
  const { replayEnabled, heatmapEnabled } = getRecorderConfig(config);

  return replayEnabled === true || heatmapEnabled === true;
}
