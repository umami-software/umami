import { TextField, Text, Column, Label } from '@umami/react-zen';
import { useMessages, useConfig } from '@/components/hooks';

const SCRIPT_NAME = 'script.js';

export function WebsiteTrackingCode({
  websiteId,
  hostUrl,
}: {
  websiteId: string;
  hostUrl?: string;
}) {
  const { formatMessage, messages, labels } = useMessages();
  const config = useConfig();

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map((n: string) => n.trim())?.[0] || SCRIPT_NAME;

  const getUrl = () => {
    if (config?.cloudMode) {
      return `${process.env.cloudUrl}/${trackerScriptName}`;
    }

    return `${hostUrl || window?.location?.origin || ''}${
      process.env.basePath || ''
    }/${trackerScriptName}`;
  };

  const url = trackerScriptName?.startsWith('http') ? trackerScriptName : getUrl();

  const code = `<script defer src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <Column gap>
      <Label>{formatMessage(labels.trackingCode)}</Label>
      <Text color="muted">{formatMessage(messages.trackingCode)}</Text>
      <TextField value={code} isReadOnly allowCopy asTextArea resize="none" />
    </Column>
  );
}
