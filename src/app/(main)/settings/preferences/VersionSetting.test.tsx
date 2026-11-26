import { afterEach, expect, test, vi } from 'vitest';
import { ConfigContext } from '@/components/hooks/useConfig';
import { type Config, getConfig } from '@/lib/config';
import { UPDATES_URL, VERSION_CHECK } from '@/lib/constants';
import { setItem } from '@/lib/storage';
import { useVersion } from '@/store/version';
import { render, screen } from '@/test/render';
import { VersionSetting } from './VersionSetting';

vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/constants')>()),
  CURRENT_VERSION: '1.0.0',
}));

afterEach(() => {
  localStorage.removeItem(VERSION_CHECK);
  vi.unstubAllGlobals();
});

function renderVersionSetting(overrides: Partial<Config> = {}) {
  const config = { ...getConfig(), privateMode: false, updatesDisabled: false, ...overrides };

  return render(
    <ConfigContext.Provider value={config}>
      <VersionSetting />
    </ConfigContext.Provider>,
  );
}

test('checks on demand and reports an update even after its automatic notice was dismissed', async () => {
  const { promise, resolve } = Promise.withResolvers<Response>();
  const fetch = vi.fn().mockReturnValue(promise);
  vi.stubGlobal('fetch', fetch);
  setItem(VERSION_CHECK, { version: '2.0.0' });
  const noticeState = useVersion.getState();

  const { user } = renderVersionSetting();
  const button = screen.getByRole('button', { name: 'Check for updates' });

  expect(fetch).not.toHaveBeenCalled();
  await user.click(button);
  expect(button).toBeDisabled();
  expect(fetch).toHaveBeenCalledWith(`${UPDATES_URL}?v=1.0.0`, expect.anything());

  const url = 'https://github.com/umami-software/umami/releases/tag/v2.0.0';
  resolve(Response.json({ latest: '2.0.0', url }));

  expect(await screen.findByRole('link', { name: 'View details' })).toHaveAttribute('href', url);
  expect(screen.getByRole('status')).toHaveTextContent(
    'A new version of Umami v2.0.0 is available!',
  );
  expect(button).toBeEnabled();
  expect(useVersion.getState()).toBe(noticeState);
});

test.each([
  [{ latest: '1.0.0' }, 'You’re up to date.'],
  [{}, 'Could not check for updates.'],
])('reports the result for %j', async (data, message) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(data)));
  const { user } = renderVersionSetting();

  await user.click(screen.getByRole('button', { name: 'Check for updates' }));

  expect(await screen.findByText(message)).toBeInTheDocument();
});

test.each([{ updatesDisabled: true }, { privateMode: true }])(
  'hides the update check with %j',
  overrides => {
    renderVersionSetting(overrides);

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check for updates' })).not.toBeInTheDocument();
  },
);
