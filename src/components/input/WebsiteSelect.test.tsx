import { beforeEach, expect, test, vi } from 'vitest';
import { buildPath } from '@/lib/url';
import { render } from '@/test/render';
import { WebsiteSelect } from './WebsiteSelect';

const mocks = vi.hoisted(() => ({ get: vi.fn(), query: vi.fn() }));

vi.mock('@/components/hooks/useApi', () => ({
  useApi: () => ({
    get: mocks.get,
    useQuery: (options: unknown) => {
      mocks.query(options);
      return { data: undefined, isLoading: false };
    },
  }),
}));
vi.mock('@/components/hooks/useModified', () => ({ useModified: () => ({ modified: 0 }) }));
vi.mock('@/components/hooks/useNavigation', () => ({ useNavigation: () => ({ query: {} }) }));
vi.mock('@/components/hooks', async () => {
  const { useUserWebsitesQuery } = await import('@/components/hooks/queries/useUserWebsitesQuery');

  return {
    useLoginQuery: () => ({ user: { id: 'user-1' } }),
    useMessages: () => ({
      t: (value: string) => value,
      labels: { selectWebsite: 'Select website' },
      messages: { noResultsFound: 'No results found' },
    }),
    useWebsiteQuery: () => ({ data: undefined }),
    useUserWebsitesQuery,
  };
});

beforeEach(() => {
  mocks.get.mockReset();
  mocks.query.mockReset();
});

async function requestedPath() {
  await mocks.query.mock.lastCall[0].queryFn();
  const [url, params] = mocks.get.mock.lastCall;

  return buildPath(url, params);
}

test('requests team websites when includeTeams is true', async () => {
  render(<WebsiteSelect includeTeams onChange={vi.fn()} />);

  expect(await requestedPath()).toBe(
    '/users/user-1/websites?search=&pageSize=100&includeTeams=true',
  );
});

test('omits includeTeams from the request when it is false', async () => {
  render(<WebsiteSelect includeTeams={false} onChange={vi.fn()} />);

  expect(await requestedPath()).toBe('/users/user-1/websites?search=&pageSize=100');
});

test('requests only the selected team websites inside a team', async () => {
  render(<WebsiteSelect teamId="team-1" includeTeams={false} onChange={vi.fn()} />);

  expect(await requestedPath()).toBe('/teams/team-1/websites?search=&pageSize=100');
});
