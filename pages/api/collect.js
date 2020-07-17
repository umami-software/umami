import { parseCollectRequest } from 'lib/utils';
import { savePageView } from '../../lib/db';

export default async (req, res) => {
  const values = parseCollectRequest(req);

  if (values) {
    const { type, session_id, url, referrer } = values;

    if (type === 'pageview') {
      await savePageView(session_id, url, referrer);
    }
  }

  res.status(200).json({ status: 'ok' });
};
