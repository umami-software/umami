import { getItem, removeItem, setItem } from '@/lib/storage';
import { AUTH_TOKEN, REFRESH_TOKEN } from './constants';
import { refreshTokensEnabled } from './jwt';

let accessToken: string | null = null;

export function getClientAuthToken() {
  if (refreshTokensEnabled()) {
    return accessToken;
  }

  return getItem(AUTH_TOKEN);
}

export function setClientAuthToken(token: string) {
  if (refreshTokensEnabled()) {
    accessToken = token;
    return;
  }

  setItem(AUTH_TOKEN, token);
}

export function removeClientAuthToken() {
  if (refreshTokensEnabled()) {
    accessToken = null;
    return;
  }

  removeItem(AUTH_TOKEN);
}

export function getClientRefreshToken() {
  return getItem(REFRESH_TOKEN);
}

export function setClientRefreshToken(token: string) {
  setItem(REFRESH_TOKEN, token)
}

export function removeClientRefreshToken() {
  removeItem(REFRESH_TOKEN);
}