# @umami/tracker

The [Umami](https://umami.is) browser tracker as an ES module. It is the same code that powers
`script.js`, packaged so you can bundle it into your own frontend instead of loading a separate
script tag. Configuration is passed as an object, so it works with build-time environment
variables and does not depend on `document.currentScript`.

```bash
pnpm add @umami/tracker
```

## Usage

Create one tracker per website, e.g. in its own module, and import it where you need it:

```ts
// analytics.ts
import { createTracker } from '@umami/tracker';

export const umami = createTracker({
  websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID,
  endpoint: 'https://analytics.example.com/api/send',
});
```

```ts
import { umami } from './analytics';

umami.track('signup-button', { plan: 'pro' });
umami.identify('user-123', { plan: 'pro' });
```

By default the tracker behaves like `script.js`: it tracks the initial page view, history
navigation (`pushState`/`replaceState`) and clicks on elements with a `data-umami-event`
attribute. Pass `autoTrack: false` to only send what you track yourself.

`createTracker` does not touch `window.umami`. Assign the tracker yourself if other code
expects it there.

## Options

| Option             | Default        | Description                                                         |
| ------------------ | -------------- | ------------------------------------------------------------------- |
| `websiteId`        |                | Website ID, required                                                |
| `endpoint`         |                | Full collect URL, required. Usually `<host>/api/send`               |
| `autoTrack`        | `true`         | Track page views, navigation and `data-umami-event` clicks          |
| `autoPageview`     | `true`         | Send page views for automatically tracked navigation                |
| `domains`          | `[]`           | Only track on these hostnames                                       |
| `doNotTrack`       | `false`        | Honor the browser's Do Not Track setting                            |
| `excludeSearch`    | `false`        | Strip query parameters from tracked URLs                            |
| `excludeHash`      | `false`        | Strip the hash from tracked URLs                                    |
| `tag`              |                | Tag attached to every event                                         |
| `distinctId`       |                | Identify the visitor on start                                       |
| `beforeSend`       |                | `(type, payload) => payload`; return a falsy value to drop an event |
| `performance`      | `false`        | Collect web vitals                                                  |
| `errors`           | `false`        | Capture uncaught errors and unhandled rejections                    |
| `release`          |                | Release attached to captured errors                                 |
| `environment`      | `'production'` | Environment attached to captured errors                             |
| `fetchCredentials` | `'omit'`       | `credentials` mode of the collect requests                          |

The options match the `data-*` attributes and `window.umamiConfig` keys of `script.js`, see the
[tracker configuration](https://umami.is/docs/tracker-configuration) docs for details.

## License

MIT
