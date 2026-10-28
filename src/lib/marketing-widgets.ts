import { z } from 'zod';

export const WIDGET_TYPES = ['callback', 'banner', 'popup', 'email'] as const;
export type WidgetType = (typeof WIDGET_TYPES)[number];

export const WIDGET_LABELS: Record<WidgetType, string> = {
  callback: 'Callback request',
  banner: 'Announcement banner',
  popup: 'Pop-up / promo',
  email: 'Email capture',
};

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const text = (max: number) => z.string().trim().max(max);
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine(v => v === '' || /^https?:\/\//i.test(v), 'Must start with http:// or https://');

export const widgetConfigSchema = z.object({
  title: text(120).default(''),
  text: text(600).default(''),
  buttonText: text(60).default(''),
  buttonUrl: httpUrl.default(''),
  imageUrl: httpUrl.default(''),
  promoCode: text(40).default(''),
  successText: text(200).default('Thank you! We will contact you shortly.'),
  consentText: text(200).default(''),
  placeholder: text(60).default(''),
  askName: z.boolean().default(true),
  askComment: z.boolean().default(false),
  accent: color.default('#3b82f6'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  position: z
    .enum(['bottom-right', 'bottom-left', 'top', 'bottom', 'center'])
    .default('bottom-right'),
  dismissible: z.boolean().default(true),
  // when to show
  trigger: z.enum(['immediate', 'delay', 'scroll', 'exit']).default('immediate'),
  delaySec: z.number().int().min(0).max(600).default(5),
  scrollPct: z.number().int().min(1).max(100).default(50),
  frequency: z.enum(['always', 'session', 'day', 'week', 'once']).default('session'),
  // where to show: one pattern per line, * is a wildcard on the path
  urlInclude: text(1000).default(''),
  urlExclude: text(1000).default(''),
  startAt: z.string().max(40).default(''),
  endAt: z.string().max(40).default(''),

  // --- look ---
  bg: color.or(z.literal('')).default(''), // '' = theme default
  fg: color.or(z.literal('')).default(''),
  radius: z.number().int().min(0).max(32).default(16),
  shadow: z.enum(['none', 'soft', 'strong']).default('soft'),
  glass: z.boolean().default(true),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  buttonStyle: z.enum(['solid', 'outline', 'pill']).default('solid'),
  icon: text(4).default(''),
  animation: z.enum(['none', 'fade', 'slide', 'pop']).default('slide'),
  overlayDim: z.number().int().min(0).max(80).default(45),
  customCss: text(3000).default(''),

  // --- scenarios ---
  devices: z.enum(['all', 'desktop', 'mobile']).default('all'),
  visitor: z.enum(['all', 'new', 'returning']).default('all'),
  minPageViews: z.number().int().min(0).max(50).default(0),
  minTimeSec: z.number().int().min(0).max(3600).default(0),
  utmSource: text(200).default(''),
  utmMedium: text(200).default(''),
  utmCampaign: text(200).default(''),
  referrer: text(200).default(''),
  hoursEnabled: z.boolean().default(false),
  hoursFrom: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('09:00'),
  hoursTo: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('18:00'),
  hoursDays: z.array(z.number().int().min(0).max(6)).max(7).default([1, 2, 3, 4, 5]),
  offHours: z.enum(['normal', 'hide', 'message']).default('message'),
  offHoursText: text(300).default(''),
  hideAfterConversion: z.boolean().default(true),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

export const widgetDeliverySchema = z.object({
  store: z.boolean().default(true),
  telegram: z
    .object({ enabled: z.boolean().default(false), chatId: text(40).default('') })
    .default({ enabled: false, chatId: '' }),
  webhook: z
    .object({
      enabled: z.boolean().default(false),
      url: z.string().trim().max(500).default(''),
      secret: z.string().max(100).default(''),
    })
    .default({ enabled: false, url: '', secret: '' }),
});
export type WidgetDelivery = z.infer<typeof widgetDeliverySchema>;

export const widgetInputSchema = z.object({
  type: z.enum(WIDGET_TYPES),
  name: text(200).min(1),
  enabled: z.boolean().default(true),
  config: widgetConfigSchema,
  delivery: widgetDeliverySchema,
});

export function defaultConfig(type: WidgetType): WidgetConfig {
  const base = widgetConfigSchema.parse({});
  switch (type) {
    case 'callback':
      return {
        ...base,
        title: 'Request a call',
        text: 'Leave your number and we will call you back.',
        buttonText: 'Call me back',
        position: 'bottom-right',
        trigger: 'immediate',
        frequency: 'always',
      };
    case 'banner':
      return {
        ...base,
        text: 'Spring sale: -20% on everything',
        buttonText: 'Learn more',
        position: 'top',
        trigger: 'immediate',
        frequency: 'session',
      };
    case 'popup':
      return {
        ...base,
        title: 'Special offer',
        text: 'Get 10% off your first order.',
        promoCode: 'WELCOME10',
        buttonText: 'Shop now',
        position: 'center',
        trigger: 'delay',
        delaySec: 8,
        frequency: 'day',
      };
    case 'email':
      return {
        ...base,
        title: 'Stay in the loop',
        text: 'News and offers, no spam.',
        buttonText: 'Subscribe',
        placeholder: 'you@example.com',
        position: 'bottom-right',
        trigger: 'scroll',
        scrollPct: 40,
        frequency: 'week',
        successText: 'Subscribed, thank you!',
      };
  }
}

/** Server-side lead validation: only known fields, bounded lengths. */
export function parseLead(type: WidgetType, input: any) {
  const clean = (v: any, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const phone = clean(input?.phone, 32);
  const email = clean(input?.email, 200);
  const name = clean(input?.name, 100);
  const comment = clean(input?.comment, 500);

  if (type === 'callback') {
    if (!/^[+\d][\d\s()\-.]{5,31}$/.test(phone)) return null;
    return { name, phone, ...(comment ? { comment } : {}) };
  }

  if (type === 'email' || type === 'popup') {
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return null;
    return { email, ...(name ? { name } : {}) };
  }

  return null;
}

/** Hostname must be the website's domain or a subdomain of it. */
export function originMatchesDomain(
  originOrUrl: string | null | undefined,
  domain?: string | null,
) {
  if (!originOrUrl || !domain) return false;
  try {
    const host = new URL(originOrUrl).hostname.toLowerCase();
    const d = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '');
    return host === d || host.endsWith(`.${d}`);
  } catch {
    return false;
  }
}

/** Fields safe to expose publicly (never delivery settings). */
export function publicWidget(w: { id: string; type: string; config: any }) {
  return { id: w.id, type: w.type, config: w.config };
}
