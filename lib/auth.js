import { parse } from 'cookie';
import { verifySecureToken } from './crypto';

export default async req => {
  const token = parse(req.headers.cookie)['umami.auth'];

  return verifySecureToken(token);
};
