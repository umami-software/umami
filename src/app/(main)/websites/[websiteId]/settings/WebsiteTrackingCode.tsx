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
  const { formatMessage, messages, labels } = useMessages();
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
    code += `\n<script defer src="${recorderUrl}" data-website-id="${websiteId}"></script>`;
  }

  return (
    <Column gap>
      <Label>{formatMessage(labels.trackingCode)}</Label>
      <Text color="muted">{formatMessage(messages.trackingCode)}</Text>
      <TextField value={code} isReadOnly allowCopy asTextArea resize="none" />
    </Column>
  );
}
