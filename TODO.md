# TODO List

## General TODOs

- [ ] Check all source code.
- [ ] Update this list.
- [ ] Extract all envs and create `.env.example`, `.env.local` and `.env` files
- [ ] Add simple documentation about hidden functionality.

## CI/CD TODOs

- [ ] Setup lemonsquare CI/CD.

## Research TODOs

- [x] What is the function of process.env.COLLECT_API_ENDPOINT?

## Improvement TODOs

- [ ] ~~Add process.env.MAXMIND_LICENSE_KEY for more accurate city geolocation ($100 / month)~~
- [x] Add crossdomain support

## About

### Geolocation

For geolocation in dev, we are using [this repo data](https://github.com/GitSquared/node-geolite2-redist)

### Tracker

#### script

See [tracker script](/tracker/index.js)

#### Tracker configuration

| data-parameter    | description                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-website-id   | TODO                                                                                                                                                             |
| data-host-url     | By default, Umami will send data to wherever the script is located. You can override this to send data to another location.                                      |
| data-auto-track   | By default, Umami tracks all pageviews and events for you automatically. You can disable this behavior and track events yourself using the tracker functions.    |
| data-do-not-track | You can configure Umami to respect the visitor's Do Not Track setting.                                                                                           |
| data-cache        | If you get a lot of pageviews from the same user, for example in a forum website, you can cache some data to improve the performance of the tracking script.     |
| data-domains      | If you want the tracker to only run on specific domains, you can add them to your tracker script. Helps if you are working in a staging/development environment. |
| data-css-events   | Activate if you want to enable css events                                                                                                                        |

For more details [see here](https://umami.is/docs/tracker-configuration)

### References

[Tracker functions](https://umami.is/docs/tracker-functions)

[maxmind.com geoip city accuracy for Japan](https://www.maxmind.com/en/geoip2-city-accuracy-comparison?country=JP&resolution=50&cellular=all)
