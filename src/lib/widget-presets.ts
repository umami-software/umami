import type { WidgetConfig, WidgetType } from './marketing-widgets';

type Patch = Partial<WidgetConfig>;

/** One-click looks. They only touch visual fields. */
export const STYLE_PRESETS: { id: string; label: string; patch: Patch }[] = [
  {
    id: 'glass',
    label: 'Glass',
    patch: {
      bg: '',
      fg: '',
      radius: 16,
      shadow: 'soft',
      glass: true,
      buttonStyle: 'solid',
      size: 'md',
      animation: 'slide',
      customCss: '',
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    patch: {
      bg: '#ffffff',
      fg: '#111827',
      radius: 6,
      shadow: 'none',
      glass: false,
      buttonStyle: 'outline',
      size: 'md',
      animation: 'fade',
      customCss: '.card{border:1px solid #e5e7eb}',
    },
  },
  {
    id: 'bold',
    label: 'Bold',
    patch: {
      bg: '#111827',
      fg: '#ffffff',
      accent: '#facc15',
      radius: 4,
      shadow: 'strong',
      glass: false,
      buttonStyle: 'solid',
      size: 'lg',
      animation: 'pop',
      customCss: 'h3{font-size:19px;text-transform:uppercase;letter-spacing:.02em}',
    },
  },
  {
    id: 'soft',
    label: 'Soft & round',
    patch: {
      bg: '#fff7ed',
      fg: '#431407',
      accent: '#f97316',
      radius: 28,
      shadow: 'soft',
      glass: false,
      buttonStyle: 'pill',
      size: 'md',
      animation: 'pop',
      customCss: '',
    },
  },
  {
    id: 'neon',
    label: 'Dark neon',
    patch: {
      bg: '#0b1020',
      fg: '#e2e8f0',
      accent: '#22d3ee',
      radius: 14,
      shadow: 'strong',
      glass: true,
      buttonStyle: 'solid',
      size: 'md',
      animation: 'slide',
      customCss:
        '.card{border:1px solid rgba(34,211,238,.45);box-shadow:0 0 28px -6px rgba(34,211,238,.55)}',
    },
  },
];

/** Ready-made scenarios (content + trigger + targeting) per widget type. */
export const SCENARIOS: {
  id: string;
  label: string;
  description: string;
  types: WidgetType[];
  patch: Patch;
}[] = [
  {
    id: 'exit-promo',
    label: 'Exit-intent promo',
    description: 'Desktop visitors about to leave get a discount code, once a day.',
    types: ['popup'],
    patch: {
      trigger: 'exit',
      frequency: 'day',
      devices: 'desktop',
      minPageViews: 2,
      position: 'center',
      title: 'Wait! Take 10% off',
      text: 'Use the code on your first order.',
      promoCode: 'STAY10',
      buttonText: 'Claim discount',
    },
  },
  {
    id: 'scroll-news',
    label: 'Newsletter on scroll',
    description: 'Shown after reading 50% of a blog post; never to subscribers.',
    types: ['email'],
    patch: {
      trigger: 'scroll',
      scrollPct: 50,
      frequency: 'week',
      urlInclude: '/blog/*',
      hideAfterConversion: true,
      title: 'Enjoying the article?',
      text: 'Get the best posts by email.',
      buttonText: 'Subscribe',
    },
  },
  {
    id: 'hours-callback',
    label: 'Working-hours callback',
    description:
      'Mon–Fri 09–18 "we call in 5 min"; after hours the text changes to "we call tomorrow".',
    types: ['callback'],
    patch: {
      trigger: 'delay',
      delaySec: 10,
      frequency: 'always',
      hoursEnabled: true,
      hoursFrom: '09:00',
      hoursTo: '18:00',
      hoursDays: [1, 2, 3, 4, 5],
      offHours: 'message',
      offHoursText: 'We are offline now. Leave your number and we will call you back tomorrow.',
      text: 'Leave your number, we call back in 5 minutes.',
    },
  },
  {
    id: 'campaign-banner',
    label: 'Campaign banner (utm)',
    description: 'Only for visitors who came from a campaign link (?utm_source=…).',
    types: ['banner'],
    patch: {
      utmSource: 'newsletter',
      frequency: 'session',
      position: 'top',
      text: 'Welcome from our newsletter: -15% with code MAIL15',
      buttonText: 'Shop',
    },
  },
  {
    id: 'returning-banner',
    label: 'Returning visitors',
    description: 'A different message for people who already visited before.',
    types: ['banner', 'popup'],
    patch: {
      visitor: 'returning',
      frequency: 'day',
      text: 'Welcome back! New arrivals are in.',
      buttonText: 'See what is new',
    },
  },
  {
    id: 'mobile-call',
    label: 'Mobile call button',
    description: 'A floating call-back button only on phones.',
    types: ['callback'],
    patch: {
      devices: 'mobile',
      trigger: 'immediate',
      frequency: 'always',
      icon: '☎',
      buttonText: 'Call me',
      position: 'bottom-right',
    },
  },
  {
    id: 'engaged-popup',
    label: 'Engaged visitors',
    description: 'Pop-up after 3 pages and 60 seconds on the site, once a week.',
    types: ['popup', 'email'],
    patch: { trigger: 'immediate', minPageViews: 3, minTimeSec: 60, frequency: 'week' },
  },
  {
    id: 'timed-sale',
    label: 'Time-limited sale',
    description: 'Visible only between the start and end dates you set below.',
    types: ['banner', 'popup'],
    patch: { frequency: 'session', text: 'Weekend sale: -20%', buttonText: 'Shop now' },
  },
];
