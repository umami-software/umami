import { Column, Label, Text, TextField } from '@umami/react-zen';
import { useConfig, useMessages, useWebsite } from '@/components/hooks';

const SCRIPT_NAME = 'script.js';
const RECORDER_NAME = 'recorder.js';

export function WebsiteTrackingCode({
  websiteId,
  hostUrl,
}: {
  websiteId: string;
  hostUrl?: string;
}) {
  const { t, messages, labels } = useMessages();
  const config = useConfig();
  const website = useWebsite();

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map((n: string) => n.trim())?.[0] || SCRIPT_NAME;

  const getUrl = (scriptName: string) => {
    if (config?.cloudMode) {
      return `${process.env.cloudUrl}/${scriptName}`;
    }

    return `${hostUrl || window?.location?.origin || ''}${
      process.env.basePath || ''
    }/${scriptName}`;
  };

  const url = trackerScriptName?.startsWith('http') ? trackerScriptName : getUrl(trackerScriptName);

  let code = `<script defer src="${url}" data-website-id="${websiteId}"></script>`;

  if (website?.replayEnabled) {
    const recorderUrl = getUrl(RECORDER_NAME);
    const replayConfig = (website.replayConfig as any) || {};
    let recorderAttrs = `data-website-id="${websiteId}"`;
    if (replayConfig.sampleRate !== undefined)
      recorderAttrs += ` data-sample-rate="${replayConfig.sampleRate}"`;
    if (replayConfig.maskLevel) recorderAttrs += ` data-mask-level="${replayConfig.maskLevel}"`;
    if (replayConfig.maxDuration !== undefined)
      recorderAttrs += ` data-max-duration="${replayConfig.maxDuration}"`;
    if (replayConfig.blockSelector)
      recorderAttrs += ` data-block-selector="${replayConfig.blockSelector}"`;
    code += `\n<script defer src="${recorderUrl}" ${recorderAttrs}></script>`;
  }

  return (
    <Column gap>
      <Label>{t(labels.trackingCode)}</Label>
      <Text color="muted">{t(messages.trackingCode)}</Text>
      <TextField value={code} isReadOnly allowCopy asTextArea resize="none" />
    </Column>
  );
}
