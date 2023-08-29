import { TextArea } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useConfig from 'components/hooks/useConfig';
import { useRouter } from 'next/router';

export function TrackingCode({ websiteId }) {
  const { formatMessage, messages } = useMessages();
  const { basePath } = useRouter();
  const config = useConfig();

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map(n => n.trim())?.[0] || 'script.js';

  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${process.env.analyticsUrl || location.origin}${basePath}/${trackerScriptName}`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}

export default TrackingCode;
