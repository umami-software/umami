import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SearchSelect } from './SearchSelect';

const items = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
];

test('searches with the search field and selects an option with the keyboard', async () => {
  const onSearch = vi.fn();
  const onChange = vi.fn();
  const { user } = render(
    <SearchSelect items={items} renderValue="Pick one" onSearch={onSearch} onChange={onChange} />,
  );

  await user.click(screen.getByRole('combobox'));

  const search = await screen.findByRole('combobox', { name: 'Search' });
  await user.type(search, 'be');

  expect(onSearch).toHaveBeenLastCalledWith('be');

  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

  expect(onChange).toHaveBeenCalledWith('b');
});

test('the search field clear button resets the search', async () => {
  const onSearch = vi.fn();
  const { user } = render(
    <SearchSelect items={items} renderValue="Pick one" onSearch={onSearch} />,
  );

  await user.click(screen.getByRole('combobox'));
  await user.type(await screen.findByRole('combobox', { name: 'Search' }), 'x');
  await user.click(screen.getByRole('button', { name: 'Clear search' }));

  expect(onSearch).toHaveBeenLastCalledWith('');
  expect(screen.getByRole('combobox', { name: 'Search' })).toHaveValue('');
});
