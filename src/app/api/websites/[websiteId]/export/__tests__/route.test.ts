import { GET } from '../route';

// Mock the dependencies
jest.mock('@/lib/request', () => ({
  getQueryFilters: jest.fn().mockResolvedValue({}),
  parseRequest: jest.fn().mockResolvedValue({
    auth: { userId: 'test-user' },
    query: {},
    error: null,
  }),
}));

jest.mock('@/lib/response', () => ({
  unauthorized: jest.fn().mockReturnValue({ status: 401, json: () => {} }),
  json: jest.fn().mockImplementation((data) => ({ status: 200, json: () => Promise.resolve(data) })),
}));

jest.mock('@/permissions', () => ({
  canViewWebsite: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/queries/sql', () => ({
  getEventMetrics: jest.fn().mockResolvedValue([]),
  getPageviewMetrics: jest.fn().mockResolvedValue([]),
  getSessionMetrics: jest.fn().mockResolvedValue([]),
}));

describe('Export API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when no data is available', async () => {
    const request = new Request('http://localhost:3000');
    const params = Promise.resolve({ websiteId: 'test-website' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'no_data' });
  });

  it('should return zip data when data is available', async () => {
    // Mock some data being returned
    const mockData = [{ id: 1, name: 'Test' }];
    
    require('@/queries/sql').getEventMetrics.mockResolvedValueOnce(mockData);
    require('@/queries/sql').getPageviewMetrics.mockResolvedValueOnce([]);
    require('@/queries/sql').getSessionMetrics.mockResolvedValueOnce([]);

    const request = new Request('http://localhost:3000');
    const params = Promise.resolve({ websiteId: 'test-website' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toHaveProperty('zip');
    expect(typeof data.zip).toBe('string');
  });
});