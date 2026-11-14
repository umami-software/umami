import { beforeEach, describe, expect, test, vi } from 'vitest';
import Layout from './layout';

// The website layout is a Server Component. A database failure here must reach the
// nearest error.tsx boundary (src/app/(main)/error.tsx) so the user can retry.
const { findUnique, findFirst, websiteLayout } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  websiteLayout: vi.fn(() => null),
}));

vi.mock('@/lib/prisma', () => ({
  default: { client: { website: { findUnique }, share: { findFirst } } },
  getSchema: vi.fn(),
}));
vi.mock('@/lib/redis', () => ({ default: { enabled: false } }));
vi.mock('@/queries/prisma', async () => {
  const actual = await import('@/queries/prisma/website');
  return { getWebsite: actual.getWebsite };
});
vi.mock('./WebsiteLayout', () => ({ WebsiteLayout: websiteLayout }));

const websiteId = '123e4567-e89b-42d3-a456-426614174000';
const children = <div>website content</div>;
const modal = <div>modal content</div>;
const renderLayout = () => Layout({ params: Promise.resolve({ websiteId }), children, modal });

beforeEach(() => {
  findUnique.mockReset().mockResolvedValue({ id: websiteId, deletedAt: null });
  findFirst.mockReset().mockResolvedValue(null);
  websiteLayout.mockClear();
});

describe('website layout database failures', () => {
  test('propagates a website lookup failure to the error boundary', async () => {
    const failure = new Error('Timed out fetching a new connection from the connection pool');
    findUnique.mockRejectedValueOnce(failure);

    await expect(renderLayout()).rejects.toBe(failure);
    expect(websiteLayout).not.toHaveBeenCalled();
  });

  test('renders the website layout once the database is available again', async () => {
    findUnique.mockRejectedValueOnce(new Error('Timed out fetching a new connection'));

    await expect(renderLayout()).rejects.toThrow('Timed out fetching a new connection');

    const result = await renderLayout();

    expect(result?.type).toBe(websiteLayout);
    expect(result?.props).toEqual({ websiteId, children: [children, modal] });
    expect(findUnique).toHaveBeenCalledTimes(2);
  });
});
