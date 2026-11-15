import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { LinkEditForm } from './LinkEditForm';

const mockMutateAsync = vi.fn();
const mockUseConfig = vi.fn();
const mockUseLinkQuery = vi.fn();

vi.mock('@/components/hooks/useConfig', () => ({
  useConfig: () => mockUseConfig(),
}));

vi.mock('@/components/hooks/queries/useUpdateQuery', () => ({
  useUpdateQuery: () => ({
    mutateAsync: mockMutateAsync,
    error: null,
    isPending: false,
    touch: vi.fn(),
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useLinkQuery: (linkId?: string) => mockUseLinkQuery(linkId),
  };
});

const link = {
  id: 'link-1',
  name: 'Docs',
  url: 'https://example.com/docs',
  slug: 'abcdefgh',
  baseUrl: null,
};

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockUseConfig.mockReturnValue({
    linksUrl: 'https://example.com',
    linksUrls: ['https://example.com', 'https://go.example.org'],
  });
  mockUseLinkQuery.mockReturnValue({ data: link, isLoading: false });
});

// Saving an unrelated change must not pin a link that follows the default base.
test('does not send a base url when the domain was left unchanged', async () => {
  render(<LinkEditForm linkId="link-1" />);

  const name = await screen.findByLabelText('Name');
  await userEvent.clear(name);
  await userEvent.type(name, 'Docs renamed');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  expect(mockMutateAsync.mock.calls[0][0]).toMatchObject({ name: 'Docs renamed' });
  expect(mockMutateAsync.mock.calls[0][0]).not.toHaveProperty('baseUrl');
});

test('sends the base url when another domain is chosen', async () => {
  render(<LinkEditForm linkId="link-1" />);

  expect(await screen.findByText('Domain')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('combobox', { name: /Domain/ }));
  await userEvent.click(await screen.findByRole('option', { name: 'https://go.example.org' }));
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
  expect(mockMutateAsync.mock.calls[0][0]).toMatchObject({ baseUrl: 'https://go.example.org' });
});

test('shows no domain choice with a single LINKS_URL', async () => {
  mockUseConfig.mockReturnValue({
    linksUrl: 'https://example.com',
    linksUrls: ['https://example.com'],
  });

  render(<LinkEditForm linkId="link-1" />);

  expect(await screen.findByLabelText('Name')).toBeInTheDocument();
  expect(screen.queryByText('Domain')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('https://example.com/abcdefgh')).toBeInTheDocument();
});
