import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ConfigContext } from '@/components/hooks/useConfig';
import { getConfig } from '@/lib/config';
import { setUser } from '@/store/app';
import { render, screen, within } from '@/test/render';
import Page from './page';

function renderInstallation(isAdmin: boolean) {
  setUser({ id: 'user-1', isAdmin });

  return render(
    <ConfigContext.Provider value={getConfig()}>
      <Page />
    </ConfigContext.Provider>,
    { route: '/settings/installation' },
  );
}

beforeEach(() => {
  vi.stubEnv('CLOUD_MODE', undefined);
  vi.stubEnv('ENABLE_SETTINGS', undefined);
});

afterEach(() => {
  setUser(null);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test.each([
  { cloudMode: undefined, enableSettings: undefined, isAdmin: true },
  { cloudMode: '1', enableSettings: '1', isAdmin: false },
])(
  'loads all counts automatically with ENABLE_SETTINGS=$enableSettings and isAdmin=$isAdmin',
  async ({ cloudMode, enableSettings, isAdmin }) => {
    vi.stubEnv('CLOUD_MODE', cloudMode);
    vi.stubEnv('ENABLE_SETTINGS', enableSettings);
    const { promise, resolve } = Promise.withResolvers<Response>();
    const fetch = vi.fn(async (url: string) => {
      if (new URL(url, 'http://localhost').searchParams.get('section') === 'records') {
        return promise;
      }

      return Response.json({ users: 5, teams: 2, websites: 1024 });
    });
    vi.stubGlobal('fetch', fetch);

    renderInstallation(isAdmin);

    expect(screen.getByRole('heading', { name: 'Installation' })).toBeInTheDocument();
    expect(screen.queryByText('Analytics database')).not.toBeInTheDocument();
    const tableElement = screen.getByRole('table', { name: 'Record counts' });
    const table = within(tableElement);
    expect(await table.findByRole('row', { name: 'Websites 1,024' })).toBeInTheDocument();
    expect(table.getByRole('row', { name: 'Users 5' })).toBeInTheDocument();
    expect(table.getByRole('row', { name: 'Teams 2' })).toBeInTheDocument();
    expect(table.getByRole('row', { name: 'Events —' })).toBeInTheDocument();
    expect(tableElement).toHaveAttribute('aria-busy', 'true');
    expect(fetch).toHaveBeenCalledTimes(2);

    resolve(
      Response.json({
        websiteEvents: 12345,
        sessions: 0,
      }),
    );

    expect(await table.findByRole('row', { name: 'Events 12,345' })).toBeInTheDocument();
    expect(table.getByRole('row', { name: 'Sessions 0' })).toBeInTheDocument();
    expect(tableElement).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByRole('button', { name: 'Load totals' })).not.toBeInTheDocument();
  },
);

test('does not render installation information or fetch counts for non-admins', () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);

  renderInstallation(false);

  expect(screen.queryByRole('heading', { name: 'Installation' })).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});
