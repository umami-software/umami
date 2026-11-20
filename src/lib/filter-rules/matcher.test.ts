import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearFilterRulesCache, isIpInCidr, isWebsiteExcluded } from './matcher';

const { getActiveWebsiteFilterRulesMock } = vi.hoisted(() => ({
  getActiveWebsiteFilterRulesMock: vi.fn(),
}));

vi.mock('@/queries/prisma/filterRule', () => ({
  getActiveWebsiteFilterRules: getActiveWebsiteFilterRulesMock,
}));

describe('Filter Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearFilterRulesCache();
  });

  describe('isIpInCidr', () => {
    it('matches IP within /24 subnet', () => {
      expect(isIpInCidr('192.168.1.45', '192.168.1.0/24')).toBe(true);
      expect(isIpInCidr('192.168.1.254', '192.168.1.0/24')).toBe(true);
      expect(isIpInCidr('192.168.2.1', '192.168.1.0/24')).toBe(false);
    });

    it('matches IP within /16 and /8 subnets', () => {
      expect(isIpInCidr('10.0.4.12', '10.0.0.0/16')).toBe(true);
      expect(isIpInCidr('10.1.0.1', '10.0.0.0/16')).toBe(false);
      expect(isIpInCidr('10.250.1.1', '10.0.0.0/8')).toBe(true);
    });

    it('handles IPv6-mapped IPv4 prefixes', () => {
      expect(isIpInCidr('::ffff:192.168.1.10', '192.168.1.0/24')).toBe(true);
    });
  });

  describe('isWebsiteExcluded', () => {
    it('returns false when no rules are configured', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([]);

      const result = await isWebsiteExcluded('website-1', {
        ip: '1.2.3.4',
        userAgent: 'Mozilla/5.0',
      });

      expect(result).toBe(false);
    });

    it('excludes request when exact IP matches', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'ip', value: '203.0.113.195', action: 'exclude' },
      ]);

      const result = await isWebsiteExcluded('website-1', {
        ip: '203.0.113.195',
      });

      expect(result).toBe(true);
    });

    it('excludes request when CIDR subnet matches', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'cidr', value: '192.168.5.0/24', action: 'exclude' },
      ]);

      const result = await isWebsiteExcluded('website-1', {
        ip: '192.168.5.42',
      });

      expect(result).toBe(true);
    });

    it('excludes request when User-Agent matches substring', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'user_agent', value: 'AhrefsBot', action: 'exclude' },
      ]);

      const result = await isWebsiteExcluded('website-1', {
        userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
      });

      expect(result).toBe(true);
    });

    it('excludes request when User-Agent matches regex pattern', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'user_agent', value: '/custom-scraper-\\d+/i', action: 'exclude' },
      ]);

      const result = await isWebsiteExcluded('website-1', {
        userAgent: 'Mozilla/5.0 Custom-Scraper-42 Crawler',
      });

      expect(result).toBe(true);
    });

    it('excludes request when Query Parameter matches', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'query_param', value: 'preview=true', action: 'exclude' },
      ]);

      const match = await isWebsiteExcluded('website-1', {
        url: 'https://example.com/blog/my-post?preview=true&author=1',
      });
      const noMatch = await isWebsiteExcluded('website-1', {
        url: 'https://example.com/blog/my-post?preview=false',
      });

      expect(match).toBe(true);
      expect(noMatch).toBe(false);
    });

    it('excludes request when Country matches', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'country', value: 'RU', action: 'exclude' },
      ]);

      const result = await isWebsiteExcluded('website-1', {
        country: 'RU',
      });

      expect(result).toBe(true);
    });

    it('caches rules and uses cached copy on second call', async () => {
      getActiveWebsiteFilterRulesMock.mockResolvedValueOnce([
        { id: '1', type: 'ip', value: '10.10.10.10', action: 'exclude' },
      ]);

      await isWebsiteExcluded('website-cache', { ip: '1.1.1.1' });
      await isWebsiteExcluded('website-cache', { ip: '1.1.1.1' });

      expect(getActiveWebsiteFilterRulesMock).toHaveBeenCalledTimes(1);
    });
  });
});
