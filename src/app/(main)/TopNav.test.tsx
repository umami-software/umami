import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { TopNav } from './TopNav';

const mockPush = vi.fn();
const mockRenderUrl = vi.fn((path: string) => path);
const mockUseNavigation = vi.fn();
const mockWebsiteSelectProps = vi.fn();

vi.mock('@/components/hooks', () => ({
  useNavigation: () => mockUseNavigation(),
}));

vi.mock('@/components/input/TeamsButton', () => ({
  TeamsButton: () => <div>TeamsButton</div>,
}));

vi.mock('@/components/input/WebsiteSelect', () => ({
  WebsiteSelect: (props: {
    includeTeams?: boolean;
    onChange: (value: string | number | null) => void;
  }) => {
    mockWebsiteSelectProps(props);
    const { onChange } = props;

    return (
      <>
        <button type="button" onClick={() => onChange(null)}>
          clear website
        </button>
        <button type="button" onClick={() => onChange('website-2')}>
          select website
        </button>
      </>
    );
  },
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
  mockWebsiteSelectProps.mockClear();
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

test('lists websites from all teams when no team is selected', () => {
  render(<TopNav />);

  expect(mockWebsiteSelectProps).toHaveBeenLastCalledWith(
    expect.objectContaining({ teamId: undefined, includeTeams: true }),
  );
});

test('lists only the selected team websites inside a team', () => {
  mockUseNavigation.mockReturnValue({
    ...mockUseNavigation(),
    teamId: 'team-1',
  });

  render(<TopNav />);

  expect(mockWebsiteSelectProps).toHaveBeenLastCalledWith(
    expect.objectContaining({ teamId: 'team-1', includeTeams: false }),
  );
});
