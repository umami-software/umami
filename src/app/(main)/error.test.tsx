import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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

test('recovers the route content when retry succeeds after a database failure', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let databaseAvailable = false;

  function WebsiteContent() {
    if (!databaseAvailable) {
      throw new Error('Timed out fetching a new connection from the connection pool');
    }
    return <div>website content</div>;
  }

  function Harness() {
    const [key, setKey] = useState(0);
    return (
      <ErrorBoundary
        resetKeys={[key]}
        fallbackRender={({ error }) => (
          <RouteError error={error} retry={() => setKey(k => k + 1)} />
        )}
      >
        <WebsiteContent />
      </ErrorBoundary>
    );
  }

  const { user } = render(<Harness />);

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText('website content')).not.toBeInTheDocument();

  databaseAvailable = true;
  await user.click(screen.getByRole('button', { name: 'Refresh' }));

  expect(screen.getByText('website content')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
