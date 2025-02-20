import sendHandler from './send';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const events = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid payload, expected an array.' });
  }

  try {
    for (const event of events) {
      const mockReq = {
        ...req,
        body: event,
        headers: { ...req.headers, origin: req.headers.origin || 'http://localhost:3000' },
      };

      const mockRes = {
        ...res,
        end: () => {}, // Prevent premature response closure
      };

      await sendHandler(mockReq, mockRes);
    }

    return res.status(200).json({ success: true, message: `${events.length} events processed.` });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
