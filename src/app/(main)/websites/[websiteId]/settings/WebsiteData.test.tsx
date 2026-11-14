import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { WebsiteData } from './WebsiteData';

const keys = new Proxy({}, { get: (_, key) => String(key) });
const config = vi.hoisted(() => ({ dataDeletionEnabled: true }));

vi.mock('@/components/hooks', () => ({
  useConfig: () => config,
  useLoginQuery: () => ({ user: { id: 'user-1' } }),
  useMessages: () => ({ t: (value: string) => value, labels: keys, messages: keys }),
  useModified: () => ({ touch: vi.fn() }),
  useNavigation: () => ({
    router: { push: vi.fn() },
    pathname: '/websites/website-1/settings',
    teamId: undefined,
    renderUrl: (url: string) => url,
  }),
  useUserTeamsQuery: () => ({ data: { data: [] } }),
}));

vi.mock('./WebsiteTransferForm', () => ({ WebsiteTransferForm: () => null }));
vi.mock('./WebsiteResetForm', () => ({ WebsiteResetForm: () => null }));
vi.mock('./WebsiteDeleteForm', () => ({ WebsiteDeleteForm: () => null }));
vi.mock('./WebsiteClearDataForm', () => ({
  WebsiteClearDataForm: ({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) => (
    <div>
      <button type="button" onClick={() => onBusyChange(true)}>
        busy
      </button>
      <button type="button" onClick={() => onBusyChange(false)}>
        idle
      </button>
    </div>
  ),
}));

describe('WebsiteData', () => {
  beforeEach(() => {
    config.dataDeletionEnabled = true;
  });

  test('disables delete data and explains why when ClickHouse is enabled', () => {
    config.dataDeletionEnabled = false;

    render(<WebsiteData websiteId="website-1" />);

    expect(screen.getByRole('button', { name: 'deleteData' })).toBeDisabled();
    expect(screen.getByText('deleteDataUnavailable')).toBeInTheDocument();
    expect(screen.queryByText('deleteDataWarning')).not.toBeInTheDocument();
  });

  test('keeps the delete data dialog open while a delete runs', async () => {
    const { user } = render(<WebsiteData websiteId="website-1" />);

    await user.click(screen.getByRole('button', { name: 'deleteData' }));
    await user.click(await screen.findByRole('button', { name: 'busy' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'busy' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'idle' }));
    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'busy' })).not.toBeInTheDocument(),
    );
  });
});
