import { act } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { ThemeSetting } from './ThemeSetting';

afterEach(() => localStorage.removeItem('theme'));

test('switches from a saved theme to system mode and follows appearance changes', async () => {
  const scheme = new EventTarget();
  let dark = true;
  const matchMedia = vi.mocked(window.matchMedia).getMockImplementation();

  vi.spyOn(window, 'matchMedia').mockImplementation(query => {
    const media = matchMedia(query);

    if (query !== '(prefers-color-scheme: dark)') {
      return media;
    }

    return {
      ...media,
      get matches() {
        return dark;
      },
      addEventListener: scheme.addEventListener.bind(scheme),
      removeEventListener: scheme.removeEventListener.bind(scheme),
    };
  });
  localStorage.setItem('theme', 'light');

  const { user } = render(<ThemeSetting />);
  const lightTab = screen.getByRole('tab', { name: 'Light' });
  const systemTab = screen.getByRole('tab', { name: 'System' });

  expect(lightTab).toHaveAttribute('aria-selected', 'true');
  await user.click(systemTab);

  expect(systemTab).toHaveAttribute('aria-selected', 'true');
  expect(localStorage.getItem('theme')).toBeNull();
  expect(document.documentElement).toHaveClass('dark');

  act(() => {
    dark = false;
    scheme.dispatchEvent(new Event('change'));
  });

  expect(document.documentElement).not.toHaveClass('dark');
  expect(systemTab).toHaveAttribute('aria-selected', 'true');
  expect(localStorage.getItem('theme')).toBeNull();

  await user.click(lightTab);
  expect(localStorage.getItem('theme')).toBe('light');
});
