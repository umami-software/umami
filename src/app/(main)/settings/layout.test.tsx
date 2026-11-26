import type { ReactNode } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import Layout from './layout';

vi.mock('./SettingsLayout', () => ({
  SettingsLayout: ({ children }: { children: ReactNode }) => children,
}));

afterEach(() => vi.unstubAllEnvs());

test.each([
  { cloudMode: undefined, enableSettings: undefined, visible: true },
  { cloudMode: '1', enableSettings: undefined, visible: false },
  { cloudMode: '1', enableSettings: '0', visible: false },
  { cloudMode: '1', enableSettings: 'false', visible: false },
  { cloudMode: '1', enableSettings: '1', visible: true },
  { cloudMode: '1', enableSettings: 'true', visible: true },
])(
  'renders local Settings=$visible with CLOUD_MODE=$cloudMode and ENABLE_SETTINGS=$enableSettings',
  ({ cloudMode, enableSettings, visible }) => {
    vi.stubEnv('CLOUD_MODE', cloudMode);
    vi.stubEnv('ENABLE_SETTINGS', enableSettings);

    render(<Layout>Local settings</Layout>);

    expect(!!screen.queryByText('Local settings')).toBe(visible);
  },
);
