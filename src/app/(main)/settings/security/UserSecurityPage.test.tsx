import { afterEach, expect, test, vi } from 'vitest';
import { ConfigContext } from '@/components/hooks/useConfig';
import { getConfig } from '@/lib/config';
import { render, screen } from '@/test/render';
import Layout from '../layout';
import { UserSecurityPage } from './UserSecurityPage';

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useTwoFactorStatusQuery: () => ({
      data: { isEnabled: false, isRequired: false, isConfigured: true },
      isLoading: false,
    }),
  };
});

afterEach(() => vi.unstubAllEnvs());

test.each([
  { cloudMode: undefined, enableSettings: undefined, visible: true },
  { cloudMode: '1', enableSettings: undefined, visible: false },
  { cloudMode: '1', enableSettings: '1', visible: true },
])(
  'renders the security panels=$visible with CLOUD_MODE=$cloudMode and ENABLE_SETTINGS=$enableSettings',
  ({ cloudMode, enableSettings, visible }) => {
    vi.stubEnv('CLOUD_MODE', cloudMode);
    vi.stubEnv('ENABLE_SETTINGS', enableSettings);

    render(
      <ConfigContext.Provider value={getConfig()}>
        <Layout>
          <UserSecurityPage />
        </Layout>
      </ConfigContext.Provider>,
    );

    expect(!!screen.queryByRole('button', { name: 'Change password' })).toBe(visible);
    expect(!!screen.queryByText('Update the password you use to sign in to Umami.')).toBe(visible);
    expect(!!screen.queryByText('Two-factor authentication')).toBe(visible);
  },
);
