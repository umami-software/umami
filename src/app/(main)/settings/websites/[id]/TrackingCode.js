import { TextArea } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useConfig from 'components/hooks/useConfig';

export function TrackingCode({ websiteId, analyticsUrl }) {
  const { formatMessage, messages } = useMessages();
  const config = useConfig();

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map(n => n.trim())?.[0] || 'script.js';

  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${analyticsUrl || location.origin}${process.env.basePath}/${trackerScriptName}`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}

export default TrackingCode;
