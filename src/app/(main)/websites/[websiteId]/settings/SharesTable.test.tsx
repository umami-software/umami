import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SharesTable } from './SharesTable';

vi.mock('@/components/hooks', () => ({
  useConfig: () => ({ cloudMode: false }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      name: 'Name',
      shareUrl: 'Share URL',
      edit: 'Edit',
      delete: 'Delete',
      share: 'Share',
      confirm: 'Confirm',
    },
    messages: { confirmRemove: 'Remove {target}' },
    getErrorMessage: () => null,
  }),
  useMobile: () => ({ isMobile: false }),
  useDeleteQuery: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useModified: () => ({
    touch: vi.fn(),
  }),
}));

vi.mock('@/components/common/ConfirmationForm', () => ({
  ConfirmationForm: () => <div>confirmation</div>,
}));

vi.mock('./ShareEditForm', () => ({
  ShareEditForm: () => <div>share edit form</div>,
}));

describe('SharesTable', () => {
  test('renders the share url content in the table row with actions', () => {
    render(<SharesTable data={[{ id: '1', name: 'hello', slug: 'world' }]} />, {
      route: 'https://app.umami.is/settings',
    });

    const link = screen.getByRole('link', { name: 'http://localhost:3000/share/world' });

    expect(link).toHaveAttribute('href', 'http://localhost:3000/share/world');
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('Share URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy url/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
