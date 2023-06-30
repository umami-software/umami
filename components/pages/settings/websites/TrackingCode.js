import { TextArea } from 'react-basics';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export function TrackingCode({ websiteId }) {
  const { formatMessage, messages } = useMessages();
  const { basePath, trackerScriptName } = useConfig();
  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${location.origin}${basePath}/${
        trackerScriptName?.split(',')?.map(n => n.trim())?.[0] || 'script.js'
      }`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}

export default TrackingCode;
