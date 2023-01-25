import { TextArea } from 'react-basics';
import { TRACKER_SCRIPT_URL } from 'lib/constants';
import { messages } from 'components/messages';
import { useIntl } from 'react-intl';

export default function TrackingCode({ websiteId }) {
  const { formatMessage } = useIntl();
  const url = TRACKER_SCRIPT_URL.startsWith('http')
    ? TRACKER_SCRIPT_URL
    : `${location.origin}${TRACKER_SCRIPT_URL}`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>{formatMessage(messages.trackingCode)}</p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}
