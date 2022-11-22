import { getItem, setItem, removeItem } from 'next-basics';
import { AUTH_TOKEN } from './constants';

export function getAuthToken() {
  return getItem(AUTH_TOKEN);
}

export function setAuthToken(token) {
  setItem(AUTH_TOKEN, token);
}

export function removeAuthToken() {
  removeItem(AUTH_TOKEN);
}
