import { getRealtimeData } from '../getRealtimeData';

// Mock the dependencies
jest.mock('../getRealtimeActivity', () => ({
  getRealtimeActivity: jest.fn().mockResolvedValue([]),
}));

jest.mock('../pageviews/getPageviewStats', () => ({
  getPageviewStats: jest.fn().mockResolvedValue([]),
}));

jest.mock('../sessions/getSessionStats', () => ({
  getSessionStats: jest.fn().mockResolvedValue([]),
}));

describe('getRealtimeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass timezone parameter to stats functions', async () => {
    const websiteId = 'test-website';
    const filters = { timezone: 'America/New_York' };
    
    await getRealtimeData(websiteId, filters);
    
    // Verify that getPageviewStats was called with the timezone
    expect(require('../pageviews/getPageviewStats').getPageviewStats)
      .toHaveBeenCalledWith(websiteId, { ...filters, timezone: 'America/New_York' });
      
    // Verify that getSessionStats was called with the timezone
    expect(require('../sessions/getSessionStats').getSessionStats)
      .toHaveBeenCalledWith(websiteId, { ...filters, timezone: 'America/New_York' });
  });

  it('should default to UTC timezone when not provided', async () => {
    const websiteId = 'test-website';
    const filters = {};
    
    await getRealtimeData(websiteId, filters);
    
    // Verify that getPageviewStats was called with default UTC timezone
    expect(require('../pageviews/getPageviewStats').getPageviewStats)
      .toHaveBeenCalledWith(websiteId, { timezone: 'utc' });
      
    // Verify that getSessionStats was called with default UTC timezone
    expect(require('../sessions/getSessionStats').getSessionStats)
      .toHaveBeenCalledWith(websiteId, { timezone: 'utc' });
  });
});