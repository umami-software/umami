import { TextArea } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import useConfig from 'components/hooks/useConfig';
import { useContext } from 'react';
import SettingsContext from '../../SettingsContext';

export function TrackingCode({ websiteId }: { websiteId: string }) {
  const { formatMessage, messages } = useMessages();
  const config = useConfig();
  const { trackingCodeUrl } = useContext(SettingsContext);

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map(n => n.trim())?.[0] || 'script.js';

  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${trackingCodeUrl}${process.env.basePath}/${trackerScriptName}`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}

export default TrackingCode;
