import { getActiveWebsiteFilterRules } from '@/queries/prisma/filterRule';

export interface IncomingRequestInfo {
  ip?: string;
  userAgent?: string;
  country?: string;
  url?: string;
}

interface CachedRules {
  rules: { id: string; type: string; value: string; action: string }[];
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const rulesCache = new Map<string, CachedRules>();

export function clearFilterRulesCache(websiteId?: string) {
  if (websiteId) {
    rulesCache.delete(websiteId);
  } else {
    rulesCache.clear();
  }
}

/**
 * Checks if an IPv4 address is within a CIDR subnet block (e.g., 192.168.1.0/24)
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const cleanIp = ip.replace(/^::ffff:/, '');
    const [range, bitsStr] = cidr.trim().split('/');
    const bits = bitsStr ? Number.parseInt(bitsStr, 10) : 32;

    const ipParts = cleanIp.split('.').map(Number);
    const rangeParts = range.split('.').map(Number);

    if (ipParts.length !== 4 || rangeParts.length !== 4 || Number.isNaN(bits)) {
      return cleanIp === range;
    }

    const ipNum = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
    const rangeNum =
      ((rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]) >>> 0;

    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;

    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

/**
 * Checks if incoming request should be excluded based on configured rules
 */
export async function isWebsiteExcluded(
  websiteId: string,
  info: IncomingRequestInfo,
): Promise<boolean> {
  try {
    const now = Date.now();
    let cached = rulesCache.get(websiteId);

    if (!cached || cached.expiresAt < now) {
      const activeRules = await getActiveWebsiteFilterRules(websiteId);
      cached = {
        rules: activeRules || [],
        expiresAt: now + CACHE_TTL_MS,
      };
      rulesCache.set(websiteId, cached);
    }

    if (!cached.rules || cached.rules.length === 0) {
      return false;
    }

    const cleanIp = (info.ip || '').replace(/^::ffff:/, '').trim();
    const userAgent = (info.userAgent || '').toLowerCase();
    const country = (info.country || '').toUpperCase();

    // Extract query params from URL
    let queryParams: URLSearchParams | null = null;
    if (info.url?.includes('?')) {
      try {
        const queryString = info.url.split('?')[1] || '';
        queryParams = new URLSearchParams(queryString);
      } catch {
        queryParams = null;
      }
    }

    for (const rule of cached.rules) {
      const ruleValue = (rule.value || '').trim();

      switch (rule.type) {
        case 'ip': {
          if (cleanIp && cleanIp === ruleValue.replace(/^::ffff:/, '')) {
            return true;
          }
          break;
        }
        case 'cidr': {
          if (cleanIp && isIpInCidr(cleanIp, ruleValue)) {
            return true;
          }
          break;
        }
        case 'user_agent': {
          if (userAgent) {
            const lowerVal = ruleValue.toLowerCase();
            // Check substring or regex
            if (ruleValue.startsWith('/')) {
              const lastSlash = ruleValue.lastIndexOf('/');
              if (lastSlash > 0) {
                const pattern = ruleValue.slice(1, lastSlash);
                const flags = ruleValue.slice(lastSlash + 1);
                try {
                  const regex = new RegExp(pattern, flags || 'i');
                  if (regex.test(info.userAgent || '')) {
                    return true;
                  }
                } catch {
                  if (userAgent.includes(lowerVal)) return true;
                }
              }
            } else if (userAgent.includes(lowerVal)) {
              return true;
            }
          }
          break;
        }
        case 'query_param': {
          if (queryParams) {
            if (ruleValue.includes('=')) {
              const [key, val] = ruleValue.split('=');
              if (queryParams.get(key.trim()) === val?.trim()) {
                return true;
              }
            } else if (queryParams.has(ruleValue)) {
              return true;
            }
          }
          break;
        }
        case 'country': {
          if (country && country === ruleValue.toUpperCase()) {
            return true;
          }
          break;
        }
      }
    }

    return false;
  } catch {
    // Fail-open: Never disrupt analytics ingestion if database rule retrieval encounters an error
    return false;
  }
}
