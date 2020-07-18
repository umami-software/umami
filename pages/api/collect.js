import { parseCollectRequest } from 'lib/utils';
import { savePageView } from 'lib/db';
import { allowPost } from 'lib/middleware';

export default async (req, res) => {
  await allowPost(req, res);

  const values = parseCollectRequest(req);

  if (values.success) {
    const { type, session_id, url, referrer } = values;

    if (type === 'pageview') {
      await savePageView(session_id, url, referrer).catch(() => {
        values.success = 0;
      });
    }
  }

  res.status(200).json({ success: values.success });
};
