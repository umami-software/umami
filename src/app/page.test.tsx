import { render } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getTestRouter } from '@/test/navigation';
import RootPage from './page';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// With no token the user can't be logged in, so going via /websites only flashes it before /login.
test('sends visitors without a token straight to login', () => {
  render(<RootPage />);

  expect(getTestRouter().replace).toHaveBeenCalledWith('/login');
});

test('sends logged-in users to their websites', () => {
  localStorage.setItem('umami.auth', JSON.stringify('token'));

  render(<RootPage />);

  expect(getTestRouter().replace).toHaveBeenCalledWith('/websites');
});

test('sends logged-in users back to their last team', () => {
  localStorage.setItem('umami.auth', JSON.stringify('token'));
  localStorage.setItem('umami.last-team', JSON.stringify('team-1'));

  render(<RootPage />);

  expect(getTestRouter().replace).toHaveBeenCalledWith('/teams/team-1/websites');
});

// Cloud auth doesn't use the local token, so a missing token must not force /login.
test('keeps the normal flow in cloud mode', () => {
  vi.stubEnv('cloudMode', '1');

  render(<RootPage />);

  expect(getTestRouter().replace).toHaveBeenCalledWith('/websites');
});
