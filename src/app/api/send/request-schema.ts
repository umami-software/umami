import { z } from 'zod';
import { errorCollectionSchema } from '@/lib/errors/schema';
import { anyObjectParam, unixTimestampParam, urlOrPathParam } from '@/lib/schema';

// Reject strings whose first character is a spreadsheet formula trigger to
// prevent CSV formula injection in analytics exports (defense-in-depth).
const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;
const safeStringParam = () =>
  z.string().refine(val => !FORMULA_TRIGGER_RE.test(val), {
    message: 'Value must not start with =, +, -, @, tab, or carriage return',
  });

// Data is written after the event row, so anything that would fail on write must be
// rejected here. Numbers fit Postgres Decimal(19,4); revenue fits ClickHouse Decimal(18,4);
// nesting is capped so flattening cannot overflow the stack.
const MAX_DATA_DEPTH = 32;
const MAX_DATA_NUMBER = 1e15;
const MAX_REVENUE = 1e14;

function getDataError(value: unknown, depth = 1, inArray = false): string | undefined {
  if (typeof value === 'number') {
    // Array values are stored as JSON strings, so only standalone numbers hit the decimal column.
    return !inArray && Math.abs(value) >= MAX_DATA_NUMBER ? 'Number is out of range.' : undefined;
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (depth > MAX_DATA_DEPTH) {
    return `Data must not be nested more than ${MAX_DATA_DEPTH} levels.`;
  }

  for (const child of Object.values(value)) {
    const error = getDataError(child, depth + 1, inArray || Array.isArray(value));

    if (error) {
      return error;
    }
  }

  return undefined;
}

const dataParam = anyObjectParam.superRefine((value, ctx) => {
  const error = getDataError(value);

  if (error) {
    ctx.addIssue({ code: 'custom', message: error });
  }
});

const hostnameParam = z.string().refine(
  value => {
    if (!value) {
      return true;
    }

    try {
      new URL(`https://${value}`);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid hostname.' },
);

// Mirrors the condition saveEvent uses to decide whether revenue is written.
function isRevenueOutOfRange(data?: Record<string, any>) {
  const revenueValue = data?.revenue;
  const currencyValue = data?.currency;
  const revenue = Number(revenueValue);

  return (
    (typeof revenueValue === 'number' || typeof revenueValue === 'string') &&
    typeof currencyValue === 'string' &&
    !!currencyValue.trim() &&
    Number.isFinite(revenue) &&
    revenue >= MAX_REVENUE
  );
}

const payloadSchema = z.object({
  website: z.uuid().optional(),
  link: z.uuid().optional(),
  pixel: z.uuid().optional(),
  data: dataParam.optional(),
  hostname: hostnameParam.optional(),
  language: z.string().optional(),
  referrer: urlOrPathParam.optional(),
  screen: z.string().optional(),
  title: z.string().optional(),
  url: urlOrPathParam.optional(),
  name: safeStringParam().optional(),
  tag: safeStringParam().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: unixTimestampParam.optional(),
  id: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  lcp: z.number().nonnegative().max(60000).optional(),
  inp: z.number().nonnegative().max(60000).optional(),
  cls: z.number().nonnegative().max(100).optional(),
  fcp: z.number().nonnegative().max(60000).optional(),
  ttfb: z.number().nonnegative().max(60000).optional(),
});

export const collectionSchema = z
  .discriminatedUnion('type', [
    errorCollectionSchema,
    z.object({
      type: z.enum(['event', 'identify', 'performance']),
      payload: payloadSchema,
    }),
  ])
  .superRefine(({ type, payload }, ctx) => {
    if (type === 'error') return;
    if ([payload.website, payload.link, payload.pixel].filter(Boolean).length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['payload', 'website'],
        message: 'Exactly one of website, link, or pixel must be provided',
      });
    }
    if (type === 'event' && isRevenueOutOfRange(payload.data)) {
      ctx.addIssue({
        code: 'custom',
        path: ['payload', 'data', 'revenue'],
        message: 'Revenue is out of range.',
      });
    }
  });
