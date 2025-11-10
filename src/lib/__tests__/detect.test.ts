/**
 * @jest-environment node
 */
import { getClientInfo, getLocation } from '@/lib/detect';
import { getIpAddress } from '@/lib/ip';

jest.mock('is-localhost-ip');
jest.mock('maxmind');
jest.mock('@/lib/ip');

const isLocalhost = (isLocalhost as jest.Mock).mockResolvedValue(false);
const maxmind = (maxmind as jest.Mock);
const getIpAddressMock = (getIpAddress as jest.Mock).mockReturnValue('127.0.0.1');

describe('lib/detect', () => {
  describe('getClientInfo', () => {
    it('should return client info', async () => {
      const request = new Request('https://example.com');
      const payload = {};

      const result = await getClientInfo(request, payload);

      expect(result).toEqual({
        userAgent: null,
        browser: null,
        os: null,
        ip: '127.0.0.1',
        country: undefined,
        region: undefined,
        city: undefined,
        device: 'desktop',
      });
    });
  });

  describe('getLocation', () => {
    it('should return null for localhost', async () => {
      isLocalhost.mockResolvedValueOnce(true);

      const result = await getLocation('127.0.0.1', new Headers(), false);

      expect(result).toBeNull();
    });

    it('should return null when no location data is available', async () => {
      isLocalhost.mockResolvedValueOnce(false);
      maxmind.open = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      });

      const result = await getLocation('8.8.8.8', new Headers(), false);

      expect(result).toBeNull();
    });

    it('should return location data from provider headers', async () => {
      isLocalhost.mockResolvedValueOnce(false);
      
      const headers = new Headers();
      headers.set('cf-ipcountry', 'US');
      headers.set('cf-region-code', 'CA');
      headers.set('cf-ipcity', 'Los Angeles');

      const result = await getLocation('8.8.8.8', headers, false);

      expect(result).toEqual({
        country: 'US',
        region: 'US-CA',
        city: 'Los Angeles',
      });
    });

    it('should return location data from database', async () => {
      isLocalhost.mockResolvedValueOnce(false);
      maxmind.open = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({
          country: { iso_code: 'US' },
          subdivisions: [{ iso_code: 'CA' }],
          city: { names: { en: 'Los Angeles' } },
        }),
      });

      const result = await getLocation('8.8.8.8', new Headers(), false);

      expect(result).toEqual({
        country: 'US',
        region: 'US-CA',
        city: 'Los Angeles',
      });
    });

    it('should handle IPv6 addresses correctly', async () => {
      (isLocalhost as jest.Mock).mockResolvedValue(false);
      
      const mockMaxmindDb = {
        get: jest.fn().mockReturnValue({
          country: { iso_code: 'US' },
          subdivisions: [{ iso_code: 'CA' }],
          city: { names: { en: 'Los Angeles' } },
        }),
      };
      
      (maxmind.open as jest.Mock).mockResolvedValue(mockMaxmindDb);
      
      // Test IPv6 with port
      const result1 = await getLocation('[2001:db8::1]:8080', new Headers(), false);
      expect(result1).toEqual({
        country: 'US',
        region: 'US-CA',
        city: 'Los Angeles',
      });
      
      // Test IPv6 without port
      const result2 = await getLocation('2001:db8::1', new Headers(), false);
      expect(result2).toEqual({
        country: 'US',
        region: 'US-CA',
        city: 'Los Angeles',
      });
      
      // Verify that the MaxMind database is called with the cleaned IP
      expect(mockMaxmindDb.get).toHaveBeenCalledWith('2001:db8::1');
    });

    it('should handle errors gracefully', async () => {
      isLocalhost.mockResolvedValueOnce(false);
      maxmind.open = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await getLocation('8.8.8.8', new Headers(), false);

      expect(result).toBeNull();
    });
  });
});