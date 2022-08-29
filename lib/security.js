import { getItem } from 'next-basics';
import { AUTH_TOKEN } from './constants';

export function getAuthHeader() {
  const token = getItem(AUTH_TOKEN);

  return token ? { authorization: `Bearer ${token}` } : {};
}
