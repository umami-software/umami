import { SidebarProvider } from '@umami/react-zen';
import type { ReactElement } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { UserButton } from './UserButton';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/hooks', () => ({
  useConfig: () => ({ cloudMode: false }),
  useLocale: () => ({ locale: 'en-US', saveLocale: vi.fn() }),
  useLoginQuery: () => ({ user: { username: 'admin', isAdmin: false } }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      admin: 'Admin',
      dark: 'Dark',
      documentation: 'Documentation',
      language: 'Language',
      light: 'Light',
      logout: 'Logout',
      settings: 'Settings',
      support: 'Support',
      system: 'System',
      theme: 'Theme',
    },
  }),
  useMobile: () => ({ isMobile: false }),
}));

// The trigger is a SidebarMenuButton, which needs a SidebarProvider (App provides it).
function renderButton(ui: ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

afterEach(() => localStorage.removeItem('theme'));

test('renders as a sidebar menu button and opens its menu', async () => {
  const { user } = renderButton(<UserButton />);
  const button = screen.getByRole('button', { name: 'admin' });

  expect(button).toHaveAttribute('data-sidebar', 'menu-button');

  button.focus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
});

test('does not include settings, which lives in the sidebar', async () => {
  const { user } = renderButton(<UserButton />);
  const button = screen.getByRole('button', { name: 'admin' });

  button.focus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: 'Settings' })).not.toBeInTheDocument();
});

test('keeps the collapsed sidebar control accessible and interactive', async () => {
  const { user } = renderButton(<UserButton showText={false} />);
  const button = screen.getByRole('button', { name: 'admin' });

  button.focus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
});

test('closes the menu after selecting logout', async () => {
  const { user } = renderButton(<UserButton />);
  const button = screen.getByRole('button', { name: 'admin' });

  button.focus();
  await user.keyboard('{Enter}');
  await user.click(screen.getByRole('menuitem', { name: 'Logout' }));

  expect(screen.queryByRole('menuitem', { name: 'Logout' })).not.toBeInTheDocument();
});

test('selects and remembers System even when the device is already using the saved theme', async () => {
  localStorage.setItem('theme', 'light');
  const { user } = renderButton(<UserButton />);
  const button = screen.getByRole('button', { name: 'admin' });

  async function openThemeMenu() {
    button.focus();
    await user.keyboard('{Enter}');
    screen.getByRole('menuitem', { name: 'Theme' }).focus();
    await user.keyboard('{ArrowRight}');
    return screen.findByRole('menuitemradio', { name: 'System' });
  }

  const system = await openThemeMenu();
  expect(screen.getByRole('menuitemradio', { name: 'Light' })).toBeChecked();
  expect(screen.getByRole('menuitemradio', { name: 'Dark' })).not.toBeChecked();
  expect(system).not.toBeChecked();

  await user.click(system);

  expect(localStorage.getItem('theme')).toBeNull();
  expect(screen.queryByRole('menuitem', { name: 'Theme' })).not.toBeInTheDocument();
  expect(await openThemeMenu()).toBeChecked();
});
