import { z } from 'zod';
import { commerceSchema } from '@/lib/commerce';
import { anyObjectParam, urlOrPathParam } from '@/lib/schema';

// Reject strings whose first character is a spreadsheet formula trigger to
// prevent CSV formula injection in analytics exports (defense-in-depth).
const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;
const safeStringParam = () =>
  z.string().refine(val => !FORMULA_TRIGGER_RE.test(val), {
    message: 'Value must not start with =, +, -, @, tab, or carriage return',
  });

const payloadSchema = z.object({
  website: z.uuid().optional(),
  link: z.uuid().optional(),
  pixel: z.uuid().optional(),
  data: anyObjectParam.optional(),
  hostname: z.string().optional(),
  language: z.string().optional(),
  referrer: urlOrPathParam.optional(),
  screen: z.string().optional(),
  title: z.string().optional(),
  url: urlOrPathParam.optional(),
  name: safeStringParam().optional(),
  tag: safeStringParam().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.coerce.number().int().optional(),
  id: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  lcp: z.number().nonnegative().max(60000).optional(),
  inp: z.number().nonnegative().max(60000).optional(),
  cls: z.number().nonnegative().max(100).optional(),
  fcp: z.number().nonnegative().max(60000).optional(),
  ttfb: z.number().nonnegative().max(60000).optional(),
  engagement: z.number().int().positive().max(86400000).optional(),
});

export const collectionSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.enum(['identify', 'performance', 'engagement']),
      payload: payloadSchema,
    }),
    z.object({
      type: z.literal('event'),
      payload: payloadSchema.extend({
        data: z.object({ commerce: commerceSchema.optional() }).catchall(z.any()).optional(),
      }),
    }),
  ])
  .superRefine(({ type, payload }, ctx) => {
    if (type === 'event' && payload.data?.commerce && (!payload.website || !payload.name?.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['payload', 'data', 'commerce'],
        message: 'Commerce requires a named website event.',
      });
    }
    if ([payload.website, payload.link, payload.pixel].filter(Boolean).length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['payload', 'website'],
        message: 'Exactly one of website, link, or pixel must be provided',
      });
    }
  });
