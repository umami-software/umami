import { getItem, setItem, removeItem } from '@/lib/storage';
import { AUTH_TOKEN } from './constants';

export function getClientAuthToken() {
  return getItem(AUTH_TOKEN);
}

export function setClientAuthToken(token: string) {
  setItem(AUTH_TOKEN, token);
}

export function removeClientAuthToken() {
  removeItem(AUTH_TOKEN);
}
