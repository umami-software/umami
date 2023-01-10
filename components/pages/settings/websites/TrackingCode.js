import { TextArea } from 'react-basics';
import { TRACKER_SCRIPT_URL } from 'lib/constants';

export default function TrackingCode({ websiteId }) {
  const url = TRACKER_SCRIPT_URL.startsWith('http')
    ? TRACKER_SCRIPT_URL
    : `${location.origin}${TRACKER_SCRIPT_URL}`;

  const code = `<script async src="${url}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <p>
        To track stats for this website, place the following code in the <code>&lt;head&gt;</code>{' '}
        section of your HTML.
      </p>
      <TextArea rows={4} value={code} readOnly allowCopy />
    </>
  );
}
