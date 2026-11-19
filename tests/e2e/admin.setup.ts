import { expect, test as setup } from '@playwright/test';
import { DEFAULT_ADMIN_PASSWORD, umamiUser } from './helpers';

// A fresh database seeds the admin with the default password, and the app covers every page with
// the password dialog until it is replaced. Replace it once so every spec can log in with
// umamiUser.password.
setup('replace the default admin password', async ({ request }) => {
  const { username, password } = umamiUser;
  const current = await request.post('/api/auth/login', { data: { username, password } });

  if (current.ok()) {
    const { user } = await current.json();

    expect(user?.passwordChangeRequired, 'UMAMI_PASSWORD must not be the default password').toBe(
      false,
    );
    return;
  }

  const initial = await request.post('/api/auth/login', {
    data: { username, password: DEFAULT_ADMIN_PASSWORD },
  });

  expect(
    initial.status(),
    `Could not log in as ${username} with UMAMI_PASSWORD or the default password`,
  ).toBe(200);

  const { token } = await initial.json();
  const changed = await request.post('/api/me/password', {
    headers: { Authorization: `Bearer ${token}` },
    data: { currentPassword: DEFAULT_ADMIN_PASSWORD, newPassword: password },
  });

  expect(changed.status()).toBe(200);
});
