import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { TopNav } from './TopNav';

const mockPush = vi.fn();
const mockRenderUrl = vi.fn((path: string) => path);
const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', () => ({
  useNavigation: () => mockUseNavigation(),
}));

vi.mock('@/components/input/TeamsButton', () => ({
  TeamsButton: () => <div>TeamsButton</div>,
}));

vi.mock('@/components/input/WebsiteSelect', () => ({
  WebsiteSelect: ({ onChange }: { onChange: (value: string | number | null) => void }) => (
    <>
      <button type="button" onClick={() => onChange(null)}>
        clear website
      </button>
      <button type="button" onClick={() => onChange('website-2')}>
        select website
      </button>
    </>
  ),
}));

vi.mock('@/components/input/LinkSelect', () => ({
  LinkSelect: () => null,
}));

vi.mock('@/components/input/PixelSelect', () => ({
  PixelSelect: () => null,
}));

vi.mock('@/components/input/BoardSelect', () => ({
  BoardSelect: () => null,
}));

beforeEach(() => {
  mockPush.mockReset();
  mockRenderUrl.mockClear();
  mockUseNavigation.mockReturnValue({
    websiteId: 'website-1',
    linkId: undefined,
    pixelId: undefined,
    boardId: undefined,
    teamId: undefined,
    router: {
      push: mockPush,
    },
    renderUrl: mockRenderUrl,
  });
});

test('does not navigate when the website select emits null', async () => {
  const { user } = render(<TopNav />);

  await user.click(screen.getByRole('button', { name: 'clear website' }));

  expect(mockRenderUrl).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
});

test('navigates when the website select emits a website id', async () => {
  const { user } = render(<TopNav />);

  await user.click(screen.getByRole('button', { name: 'select website' }));

  expect(mockRenderUrl).toHaveBeenCalledWith('/websites/website-2', false);
  expect(mockPush).toHaveBeenCalledWith('/websites/website-2');
});
