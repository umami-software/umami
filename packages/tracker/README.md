# @umami/tracker

Umami analytics tracker library for JavaScript/TypeScript projects.

## Overview

This package contains reusable tracking logic for the Umami analytics platform.

It can be used in any JavaScript or TypeScript project to integrate Umami analytics
programmatically, i.e. without resorting to an embed code.

While this does require a separate build tool, you'll likely save a network trip
and have a higher propability of avoiding ad blockers. Do keep in mind, that
this this dependency needs to be kept up-to-date (matching your Umami instance).

## Installation

```bash
npm install @umami/tracker
# or
pnpm add @umami/tracker
# or
yarn add @umami/tracker
```

## Usage

### Basic Setup

```typescript
import { createTracker } from '@umami/tracker';

const tracker = createTracker({
  website: 'your-website-id',
  endpoint: 'https://your-umami-instance.com/api/send',
});

// Track a page view
tracker.track();

// Track a custom event
tracker.track('button-click');

// Track an event with data
tracker.track('signup', {
  plan: 'premium',
  source: 'homepage',
});
```

### Configuration Options

```typescript
interface TrackerConfig {
  website: string;              // Required: Your website ID
  endpoint?: string;            // API endpoint URL
  tag?: string;                 // Optional tag for categorizing data
  autoTrack?: boolean;          // Enable automatic page view tracking (default: true)
  domains?: string[];           // Limit tracking to specific domains
  excludeSearch?: boolean;      // Exclude search params from URLs
  excludeHash?: boolean;        // Exclude hash from URLs
  doNotTrack?: boolean;         // Respect Do Not Track browser setting
  beforeSend?: (type, payload) => payload | null;  // Modify or cancel events
  credentials?: RequestCredentials;  // Fetch credentials mode (default: 'omit')
}
```

### Advanced Usage

#### User Identification

```typescript
// Identify a user
tracker.identify('user-123');

// Identify with additional data
tracker.identify('user-123', {
  email: 'user@example.com',
  plan: 'premium',
});

// Or identify with just data
tracker.identify({
  company: 'Acme Inc',
  role: 'admin',
});
```

#### Custom Event Functions

```typescript
// Track with a custom function
tracker.track((props) => ({
  ...props,
  name: 'custom-event',
  data: {
    timestamp: Date.now(),
  },
}));
```

#### Manual Initialization

```typescript
const tracker = createTracker({
  website: 'your-website-id',
  endpoint: 'https://your-umami-instance.com/api/send',
  autoTrack: false,  // Disable auto-tracking
});

// Manually initialize when ready
tracker.init();
```

#### Before Send Hook

```typescript
const tracker = createTracker({
  website: 'your-website-id',
  endpoint: 'https://your-umami-instance.com/api/send',
  beforeSend: (type, payload) => {
    // Modify payload
    payload.custom_field = 'value';

    // Or cancel the event by returning null
    if (payload.url.includes('admin')) {
      return null;
    }

    return payload;
  },
});
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions.

```typescript
import type { TrackerConfig, UmamiTracker, EventData } from '@umami/tracker';
```

## Framework Integration

### React

```typescript
import { useEffect } from 'react';
import { createTracker } from '@umami/tracker';

const tracker = createTracker({
  website: 'your-website-id',
  endpoint: 'https://your-umami-instance.com/api/send',
});

function MyApp() {
  useEffect(() => {
    tracker.track(); // Track page view on mount
  }, []);

  return (
    <button onClick={() => tracker.track('button-click')}>
      Click me
    </button>
  );
}
```

### Vue

```typescript
import { onMounted } from 'vue';
import { createTracker } from '@umami/tracker';

const tracker = createTracker({
  website: 'your-website-id',
  endpoint: 'https://your-umami-instance.com/api/send',
});

export default {
  setup() {
    onMounted(() => {
      tracker.track();
    });

    const handleClick = () => {
      tracker.track('button-click');
    };

    return { handleClick };
  },
};
```

## Browser Compatibility

This package works in all modern browsers that support:
- ES2020 features
- `fetch` API
- `Promise`
- `URL` API

## Zero Dependencies

This package has zero runtime dependencies, keeping your bundle size small.

## License

MIT

## Related

- [Umami Analytics](https://umami.is) - The main Umami analytics platform
- [Umami Documentation](https://umami.is/docs) - Full documentation
