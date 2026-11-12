import { act, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, expect, test, vi } from 'vitest';
import { useReducedMotion } from './useReducedMotion';

let reduced: boolean;
let listeners: Set<() => void>;

beforeEach(() => {
  reduced = true;
  listeners = new Set();
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    get matches() {
      return reduced;
    },
    media: query,
    onchange: null,
    addEventListener: (_event, listener) => listeners.add(listener as () => void),
    removeEventListener: (_event, listener) => listeners.delete(listener as () => void),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

function Preference() {
  return <span>{useReducedMotion() ? 'reduced' : 'animated'}</span>;
}

test('responds to browser preference changes and unsubscribes', () => {
  const view = render(<Preference />);
  expect(screen.getByText('reduced')).toBeInTheDocument();
  act(() => {
    reduced = false;
    for (const listener of listeners) listener();
  });
  expect(screen.getByText('animated')).toBeInTheDocument();
  act(() => {
    reduced = true;
    for (const listener of listeners) listener();
  });
  expect(screen.getByText('reduced')).toBeInTheDocument();
  view.unmount();
  expect(listeners.size).toBe(0);
});

test('hydrates the server snapshot without a mismatch, then applies the preference', async () => {
  const container = document.createElement('div');
  container.innerHTML = renderToString(<Preference />);
  expect(container.textContent).toBe('animated');
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <Preference />, { onRecoverableError });
  });
  expect(container.textContent).toBe('reduced');
  expect(onRecoverableError).not.toHaveBeenCalled();
  act(() => root.unmount());
});

test('supports environments without matchMedia', () => {
  vi.spyOn(window, 'matchMedia').mockRestore();
  const original = window.matchMedia;
  Object.defineProperty(window, 'matchMedia', { value: undefined, configurable: true });
  try {
    const view = render(<Preference />);
    expect(screen.getByText('animated')).toBeInTheDocument();
    view.unmount();
  } finally {
    Object.defineProperty(window, 'matchMedia', {
      value: original,
      configurable: true,
      writable: true,
    });
  }
});
