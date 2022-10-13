/* eslint-disable no-undef */
const DOMAIN = 'http://localhost:3000';
const TRACKER_SCRIPT_NAME = 'lemonsquare';
const WEBSITE_ID = '21c0c2f5-ae71-47f2-a80a-05cc5052fec7';
const AUTO_TRACK = 'false';
const DO_NOT_TRACK = 'false';
const CACHE = 'true';

const script = document.createElement('script');
script.setAttribute('src', `${DOMAIN}/${TRACKER_SCRIPT_NAME}.js`);
script.setAttribute('data-website-id', WEBSITE_ID);
script.setAttribute('data-auto-track', AUTO_TRACK);
script.setAttribute('data-do-not-track', DO_NOT_TRACK);
script.setAttribute('data-cache', CACHE);
script.setAttribute('async', '');
script.setAttribute('defer', '');
// initialize script
document.head.appendChild(script);

analytics.subscribe('page_viewed', async event => {
  lemonsquare.trackView(event.url, event.referrer);
});

// analytics.subscribe('product_viewed', async event => {
//   fbq('track', 'ViewContent', {
//     content_ids: [event.data.productVariant.id],
//     content_name: event.data.productVariant.title,
//     currency: event.data.productVariant.price.currencyCode,
//     value: event.data.productVariant.price.amount,
//   });
// });
