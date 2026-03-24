export type TrackedProperties = {
  /**
   * Hostname of server
   *
   * @description extracted from `window.location.hostname`
   * @example 'analytics.umami.is'
   */
  hostname: string;

  /**
   * Browser language
   *
   * @description extracted from `window.navigator.language`
   * @example 'en-US', 'fr-FR'
   */
  language: string;

  /**
   * Page referrer
   *
   * @description extracted from `window.navigator.language`
   * @example 'https://analytics.umami.is/docs/getting-started'
   */
  referrer: string;

  /**
   * Screen dimensions
   *
   * @description extracted from `window.screen.width` and `window.screen.height`
   * @example '1920x1080', '2560x1440'
   */
  screen: string;

  /**
   * Page title
   *
   * @description extracted from `document.querySelector('head > title')`
   * @example 'umami'
   */
  title: string;

  /**
   * Page url
   *
   * @description built from `${window.location.pathname}${window.location.search}`
   * @example 'docs/getting-started'
   */
  url: string;

  /**
   * Website ID (required)
   *
   * @example 'b59e9c65-ae32-47f1-8400-119fcf4861c4'
   */
  website: string;

  /**
   * Optional tag for categorizing tracking data
   */
  tag?: string;

  /**
   * Optional identity ID for user identification
   */
  id?: string;
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Event Data can work with any JSON data. There are a few rules in place to maintain performance.
 * - Numbers have a max precision of 4.
 * - Strings have a max length of 500.
 * - Arrays are converted to a String, with the same max length of 500.
 * - Objects have a max of 50 properties. Arrays are considered 1 property.
 */
export interface EventData {
  [key: string]: number | string | EventData | number[] | string[] | EventData[];
}

export type EventProperties = {
  /**
   * NOTE: event names will be truncated past 50 characters
   */
  name: string;
  data?: EventData;
} & WithRequired<TrackedProperties, 'website'>;

export type PageViewProperties = WithRequired<TrackedProperties, 'website'>;

export type CustomEventFunction = (
  props: PageViewProperties,
) => EventProperties | PageViewProperties;

/**
 * Configuration options for creating a tracker instance
 */
export interface TrackerConfig {
  /**
   * Website ID (required)
   */
  website: string;

  /**
   * Full endpoint URL
   */
  endpoint?: string;

  /**
   * Optional tag for categorizing tracking data
   */
  tag?: string;

  /**
   * Enable automatic page view tracking
   * @default true
   */
  autoTrack?: boolean;

  /**
   * List of domains to track (empty means track all)
   * @default []
   */
  domains?: string[];

  /**
   * Exclude search query parameters from URLs
   * @default false
   */
  excludeSearch?: boolean;

  /**
   * Exclude hash from URLs
   * @default false
   */
  excludeHash?: boolean;

  /**
   * Respect Do Not Track browser setting
   * @default false
   */
  doNotTrack?: boolean;

  /**
   * Callback function called before sending data
   * Return modified payload or null to prevent sending
   */
  beforeSend?: (type: string, payload: any) => any | Promise<any> | null;

  /**
   * Fetch credentials mode
   * @default 'omit'
   */
  credentials?: RequestCredentials;
}

/**
 * Tracker instance interface
 */
export interface UmamiTracker {
  /**
   * Track a page view or custom event
   */
  track: {
    /**
     * Track a page view
     *
     * @example ```
     * tracker.track();
     * ```
     */
    (): Promise<void>;

    /**
     * Track an event with a given name
     *
     * NOTE: event names will be truncated past 50 characters
     *
     * @example ```
     * tracker.track('signup-button');
     * ```
     */
    (eventName: string): Promise<void>;

    /**
     * Tracks an event with dynamic data.
     *
     * NOTE: event names will be truncated past 50 characters
     *
     * @example ```
     * tracker.track('signup-button', { name: 'newsletter', id: 123 });
     * ```
     */
    (eventName: string, obj: EventData): Promise<void>;

    /**
     * Tracks a page view with custom properties
     *
     * @example ```
     * tracker.track({ website: 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2', url: '/home', title: 'Home page' });
     * ```
     */
    (properties: PageViewProperties): Promise<void>;

    /**
     * Tracks an event with fully customizable dynamic data
     *
     * @example ```
     * tracker.track((props) => ({ ...props, url: path }));
     * ```
     */
    (eventFunction: CustomEventFunction): Promise<void>;
  };

  /**
   * Identify a user
   *
   * @example ```
   * tracker.identify('user-123');
   * tracker.identify('user-123', { plan: 'premium' });
   * tracker.identify({ email: 'user@example.com' });
   * ```
   */
  identify(id: string, data?: EventData): Promise<void>;
  identify(data: EventData): Promise<void>;

  /**
   * Initialize the tracker (sets up event listeners for auto-tracking)
   */
  init(): void;
}
