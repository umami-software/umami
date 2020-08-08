import { parseSecureToken } from 'lib/crypto';
import { ok, badRequest } from 'lib/response';

export default async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await parseSecureToken(token);
    return ok(res, payload);
  } catch {
    return badRequest(res);
  }
};
