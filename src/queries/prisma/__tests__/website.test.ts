import { resetWebsite } from '../website';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  default: {
    client: {
      eventData: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      sessionData: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      websiteEvent: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      session: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      website: {
        update: jest.fn().mockResolvedValue({ id: 'test-website' }),
      },
    },
  },
}));

jest.mock('@/lib/redis', () => ({
  default: {
    client: {
      set: jest.fn(),
      del: jest.fn(),
    },
  },
}));

describe('resetWebsite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset website data in batches to avoid transaction timeouts', async () => {
    const websiteId = 'test-website';
    
    // Mock deleteMany to return 10000 records deleted on first call, then 0
    require('@/lib/prisma').default.client.eventData.deleteMany
      .mockResolvedValueOnce({ count: 10000 })
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.sessionData.deleteMany
      .mockResolvedValueOnce({ count: 10000 })
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.websiteEvent.deleteMany
      .mockResolvedValueOnce({ count: 10000 })
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.session.deleteMany
      .mockResolvedValueOnce({ count: 10000 })
      .mockResolvedValueOnce({ count: 0 });

    await resetWebsite(websiteId);

    // Verify that deleteMany was called with the correct parameters
    expect(require('@/lib/prisma').default.client.eventData.deleteMany).toHaveBeenCalledWith({
      where: { websiteId },
      take: 10000,
    });
    
    // Verify that the website update was called
    expect(require('@/lib/prisma').default.client.website.update).toHaveBeenCalledWith({
      where: { id: websiteId },
      data: {
        resetAt: expect.any(Date),
      },
    });
  });

  it('should handle single batch deletion when data is small', async () => {
    const websiteId = 'test-website';
    
    // Mock deleteMany to return 0 records deleted (no more data)
    require('@/lib/prisma').default.client.eventData.deleteMany
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.sessionData.deleteMany
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.websiteEvent.deleteMany
      .mockResolvedValueOnce({ count: 0 });
      
    require('@/lib/prisma').default.client.session.deleteMany
      .mockResolvedValueOnce({ count: 0 });

    await resetWebsite(websiteId);

    // Verify that deleteMany was called once for each model
    expect(require('@/lib/prisma').default.client.eventData.deleteMany).toHaveBeenCalledTimes(1);
    expect(require('@/lib/prisma').default.client.sessionData.deleteMany).toHaveBeenCalledTimes(1);
    expect(require('@/lib/prisma').default.client.websiteEvent.deleteMany).toHaveBeenCalledTimes(1);
    expect(require('@/lib/prisma').default.client.session.deleteMany).toHaveBeenCalledTimes(1);
    
    // Verify that the website update was called
    expect(require('@/lib/prisma').default.client.website.update).toHaveBeenCalledWith({
      where: { id: websiteId },
      data: {
        resetAt: expect.any(Date),
      },
    });
  });
});