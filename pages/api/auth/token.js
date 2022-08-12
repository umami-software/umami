import { ok, unauthorized, methodNotAllowed } from 'lib/response';
import { post } from 'lib/web';
import { parseSecureToken, key, createSecureToken } from 'lib/crypto';
import { getAccountByUsername } from 'queries';

export default async (req, res) => {
  var { authCode } = req.body;

  if (req.method === 'POST') {
    const params = {
      authorizationCode: authCode,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    };

    var { ok: authOk, data } = await post(process.env.OAUTH_URL, params);

    if (authOk) {
      const { username } = await parseSecureToken(data.token, key(process.env.CLIENT_SECRET));

      const account = await getAccountByUsername(username);

      if (account) {
        const { user_id, username, is_admin } = account;
        const user = { user_id, username, is_admin };
        const token = await createSecureToken(user);

        return ok(res, { token, user });
      }
    }

    return unauthorized(res);
  }

  return methodNotAllowed(res);
};
