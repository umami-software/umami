import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import RouteError from './error';

test('renders a generic error state with a retry action and no internal details', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const retry = vi.fn();
  const error = Object.assign(new Error('P2010: connection pool exhausted at db:5432'), {
    digest: '1234567890',
  });

  const { user } = render(<RouteError error={error} retry={retry} />);

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  expect(screen.getByText('1234567890')).toBeInTheDocument();
  expect(screen.queryByText(/P2010/)).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Refresh' }));

  expect(retry).toHaveBeenCalledOnce();
});
