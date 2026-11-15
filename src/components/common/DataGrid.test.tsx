import { act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getTestRouter, setTestUrl } from '@/test/navigation';
import { render, screen } from '@/test/render';
import { DataGrid } from './DataGrid';

const query: any = { data: { data: [], count: 0 }, isLoading: false, isFetching: false };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderGrid(route: string) {
  const result = render(
    <DataGrid query={query} allowSearch={true}>
      {null}
    </DataGrid>,
    { route },
  );

  // Stands in for a soft navigation committing: useSearchParams only changes at that point.
  const landUrl = (url: string) =>
    act(() => {
      setTestUrl(url);
      result.rerender(
        <DataGrid query={query} allowSearch={true}>
          {null}
        </DataGrid>,
      );
    });

  return { landUrl };
}

// SearchField reports each change on a zero-delay timer.
const type = (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
  act(() => vi.advanceTimersByTime(0));
};

const lastPush = () => getTestRouter().push.mock.lastCall?.[0];

test('keeps text typed while the search navigation is loading', () => {
  // On a slow network the pushed URL lands after the user typed more; overwriting the box loses that text.
  const { landUrl } = renderGrid('/websites');
  const search = screen.getByRole('searchbox');

  type(search, 'shop');
  act(() => vi.advanceTimersByTime(600));
  expect(lastPush()).toBe('/websites?search=shop&page=1');

  type(search, 'shop stu');
  landUrl('/websites?search=shop&page=1');

  expect(search).toHaveValue('shop stu');

  act(() => vi.advanceTimersByTime(600));
  expect(lastPush()).toBe('/websites?search=shop+stu&page=1');
});

test('copies URL changes it did not push into the box', () => {
  // Back, forward and links to a filtered list must still show their search.
  const { landUrl } = renderGrid('/websites?search=shop');

  landUrl('/websites?search=studio');

  expect(screen.getByRole('searchbox')).toHaveValue('studio');
});

test('copies a URL matching a push that never landed', () => {
  // A push abandoned mid-load (e.g. back) must not hide a later navigation to the same value.
  const { landUrl } = renderGrid('/websites?search=a');
  const search = screen.getByRole('searchbox');

  type(search, 'shop');
  act(() => vi.advanceTimersByTime(600));
  landUrl('/websites?search=b');
  landUrl('/websites?search=a');
  landUrl('/websites?search=shop');

  expect(search).toHaveValue('shop');
});
