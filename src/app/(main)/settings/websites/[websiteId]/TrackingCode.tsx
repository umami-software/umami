import { TextArea } from 'react-basics';
import { useMessages, useConfig } from 'components/hooks';

const SCRIPT_NAME = 'script.js';

export function TrackingCode({ websiteId, hostUrl }: { websiteId: string; hostUrl?: string }) {
  const { formatMessage, messages } = useMessages();
  const config = useConfig();

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map((n: string) => n.trim())?.[0] || SCRIPT_NAME;

  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${hostUrl || window?.location.origin || ''}${
        process.env.basePath || ''
      }/${trackerScriptName}`;

  const code = `<script defer src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}

export default TrackingCode;
