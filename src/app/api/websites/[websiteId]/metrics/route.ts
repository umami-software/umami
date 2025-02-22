import { z } from 'zod';
import thenby from 'thenby';
import { canViewWebsite } from '@/lib/auth';
import {
  SESSION_COLUMNS,
  EVENT_COLUMNS,
  FILTER_COLUMNS,
  OPERATORS,
  SEARCH_DOMAINS,
  SOCIAL_DOMAINS,
  EMAIL_DOMAINS,
  SHOPPING_DOMAINS,
  VIDEO_DOMAINS,
  PAID_AD_PARAMS,
} from '@/lib/constants';
import { getRequestFilters, getRequestDateRange, parseRequest } from '@/lib/request';
import { json, unauthorized, badRequest } from '@/lib/response';
import { getPageviewMetrics, getSessionMetrics, getChannelMetrics } from '@/queries';
import { filterParams } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: z.string(),
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    search: z.string().optional(),
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type, limit, offset, search } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(query);
  const column = FILTER_COLUMNS[type] || type;
  const filters = {
    ...getRequestFilters(query),
    startDate,
    endDate,
  };

  if (search) {
    filters[type] = {
      name: type,
      column,
      operator: OPERATORS.contains,
      value: search,
    };
  }

  if (SESSION_COLUMNS.includes(type)) {
    const data = await getSessionMetrics(websiteId, type, filters, limit, offset);

    if (type === 'language') {
      const combined = {};

      for (const { x, y } of data) {
        const key = String(x).toLowerCase().split('-')[0];

        if (combined[key] === undefined) {
          combined[key] = { x: key, y };
        } else {
          combined[key].y += y;
        }
      }

      return json(Object.values(combined));
    }

    return json(data);
  }

  if (EVENT_COLUMNS.includes(type)) {
    const data = await getPageviewMetrics(websiteId, type, filters, limit, offset);

    return json(data);
  }

  if (type === 'channel') {
    const data = await getChannelMetrics(websiteId, filters);

    const channels = getChannels(data);

    return json(
      Object.keys(channels)
        .map(key => ({ x: key, y: channels[key] }))
        .sort(thenby.firstBy('y', -1)),
    );
  }

  return badRequest();
}

function getChannels(data: { domain: string; query: string; visitors: number }[]) {
  const channels = {
    direct: 0,
    referral: 0,
    affiliate: 0,
    email: 0,
    sms: 0,
    organicSearch: 0,
    organicSocial: 0,
    organicShopping: 0,
    organicVideo: 0,
    paidAds: 0,
    paidSearch: 0,
    paidSocial: 0,
    paidShopping: 0,
    paidVideo: 0,
  };

  const match = (value: string) => {
    return (str: string | RegExp) => {
      return typeof str === 'string' ? value?.includes(str) : (str as RegExp).test(value);
    };
  };

  for (const { domain, query, visitors } of data) {
    if (!domain && !query) {
      channels.direct += Number(visitors);
    }

    const prefix = /utm_medium=(.*cp.*|ppc|retargeting|paid.*)/.test(query) ? 'paid' : 'organic';

    if (SEARCH_DOMAINS.some(match(domain)) || /utm_medium=organic/.test(query)) {
      channels[`${prefix}Search`] += Number(visitors);
    } else if (
      SOCIAL_DOMAINS.some(match(domain)) ||
      /utm_medium=(social|social-network|social-media|sm|social network|social media)/.test(query)
    ) {
      channels[`${prefix}Social`] += Number(visitors);
    } else if (EMAIL_DOMAINS.some(match(domain)) || /utm_medium=(.*e[-_ ]?mail.*)/.test(query)) {
      channels.email += Number(visitors);
    } else if (
      SHOPPING_DOMAINS.some(match(domain)) ||
      /utm_campaign=(.*(([^a-df-z]|^)shop|shopping).*)/.test(query)
    ) {
      channels[`${prefix}Shopping`] += Number(visitors);
    } else if (VIDEO_DOMAINS.some(match(domain)) || /utm_medium=(.*video.*)/.test(query)) {
      channels[`${prefix}Video`] += Number(visitors);
    } else if (PAID_AD_PARAMS.some(match(query))) {
      channels.paidAds += Number(visitors);
    } else if (/utm_medium=(referral|app|link)/.test(query)) {
      channels.referral += Number(visitors);
    } else if (/utm_medium=affiliate/.test(query)) {
      channels.affiliate += Number(visitors);
    } else if (/utm_(source|medium)=sms/.test(query)) {
      channels.sms += Number(visitors);
    }
  }

  return channels;
}
