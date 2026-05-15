import { expect, test } from 'vitest';
import { render, screen } from '@/test/render';
import { Empty } from './Empty';

test('renders the default empty state message', () => {
  render(<Empty />);

  expect(screen.getByText('No data available.')).toBeInTheDocument();
});

test('renders a custom empty state message', () => {
  render(<Empty message="Nothing matched the current filters." />);

  expect(screen.getByText('Nothing matched the current filters.')).toBeInTheDocument();
});
