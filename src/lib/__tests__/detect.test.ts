import { getLocation } from '../detect';
import isLocalhost from 'is-localhost-ip';
import maxmind from 'maxmind';

// Mock the dependencies
jest.mock('is-localhost-ip', () => jest.fn());
jest.mock('maxmind', () => ({
  open: jest.fn(),
}));

describe('getLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete global.maxmind;
  });

  it('should return null for localhost IPs', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(true);
    
    const result = await getLocation('127.0.0.1', new Headers(), false);
    
    expect(result).toBeNull();
  });

  it('should return location data from provider headers', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(false);
    
    const headers = new Headers();
    headers.set('cf-ipcountry', 'KR');
    headers.set('cf-region-code', '11');
    headers.set('cf-ipcity', 'Seoul');
    
    const result = await getLocation('1.2.3.4', headers, false);
    
    expect(result).toEqual({
      country: 'KR',
      region: 'KR-11',
      city: 'Seoul',
    });
  });

  it('should return location data from MaxMind database', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(false);
    
    const mockMaxmindDb = {
      get: jest.fn().mockReturnValue({
        country: { iso_code: 'KR' },
        subdivisions: [{ iso_code: '11' }],
        city: { names: { en: 'Seoul' } },
      }),
    };
    
    (maxmind.open as jest.Mock).mockResolvedValue(mockMaxmindDb);
    
    const result = await getLocation('1.2.3.4', new Headers(), false);
    
    expect(result).toEqual({
      country: 'KR',
      region: 'KR-11',
      city: 'Seoul',
    });
  });

  it('should try multiple sources for country code', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(false);
    
    const mockMaxmindDb = {
      get: jest.fn().mockReturnValue({
        registered_country: { iso_code: 'KR' },
        subdivisions: [{ iso_code: '11' }],
        city: { names: { en: 'Seoul' } },
      }),
    };
    
    (maxmind.open as jest.Mock).mockResolvedValue(mockMaxmindDb);
    
    const result = await getLocation('1.2.3.4', new Headers(), false);
    
    expect(result).toEqual({
      country: 'KR',
      region: 'KR-11',
      city: 'Seoul',
    });
  });

  it('should return null if no country code is available', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(false);
    
    const mockMaxmindDb = {
      get: jest.fn().mockReturnValue({
        // No country information
        subdivisions: [{ iso_code: '11' }],
        city: { names: { en: 'Seoul' } },
      }),
    };
    
    (maxmind.open as jest.Mock).mockResolvedValue(mockMaxmindDb);
    
    const result = await getLocation('1.2.3.4', new Headers(), false);
    
    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    (isLocalhost as jest.Mock).mockResolvedValue(false);
    
    (maxmind.open as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    const result = await getLocation('1.2.3.4', new Headers(), false);
    
    expect(result).toBeNull();
  });
});