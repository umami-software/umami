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

// https://shopify.dev/api/pixels/customer-events

// // Event structure
// const event_structure = {
//   id: 'id of the event',
//   clientId: 'id of the client',
//   name: 'name of the event',
//   timestamp: 'timestamp of the event',
//   context: {
//     window: {
//       screenX: 0,
//       screenY: 0,
//       origin: 'the global origin of the window',
//       location: {
//         href: 'the entire url',
//         hostname: '',
//         search: '?',
//         hash: '#',
//         pathname: '/',
//       },
//     },
//     document: {
//       location: {
//         // same as above
//       },
//       referrer: 'returns the URI of the page that linked to this page.',
//       title: 'returns the title of the current page',
//     },
//     navigator: {
//       language: 'returns the language of the browser',
//       userAgent: 'returns the user-agent header sent by the browser to the server',
//     },
//   },
// };

// // page_viewed Event
// const page_viewed = {
//   // ...event_structure
// };

// analytics.subscribe('page_viewed', async event => {
//   lemonsquare.trackView(
//     event.context.location.pathname,
//     event.context.document.referrer,
//     WEBSITE_ID,
//   );
// });

// // product_viewed Event
// const product_viewed = {
//   // ...event_structure
//   data: {
//     productVariant: {
//       id: 'globally unique identifier',
//       image: {
//         src: 'string',
//       },
//       price: {
//         amount: 0,
//         currencyCode: 'string',
//       },
//       product: {
//         id: 'the id of the product',
//         title: 'the title of the product',
//         vendor: "the product's vendor name",
//       },
//       sku: 'The SKU (stock keeping unit) associated with the variant',
//       title: "The product variant's title.",
//     },
//   },
// };

// analytics.subscribe('product_viewed', async event => {});

// // product_added_to_cart event
// const product_added_to_cart = {
//   // ...event_structure
//   data: {
//     cartLine: {
//       cost: {
//         totalAmount: {
//           amount: 0,
//           currencyCode: 'string',
//         },
//       },
//       merchandise: {
//         // ...product_viewed.data.productVariant
//       },
//       quantity: 0,
//     },
//   },
// };

// analytics.subscribe('product_added_to_cart', async event => {});

// // collection_viewed event
// const collection_viewed = {
//   // ...event_structure
//   data: {
//     collection: {
//       id: 'globally unique identifier',
//       title: 'the title of the collection',
//     },
//   },
// };

// analytics.subscribe('collection_viewed', async event => {});

// // search_submitted event
// const search_submitted = {
//   // ...event_structure
//   data: {
//     searchResult: {
//       query: 'the query string',
//     },
//   },
// };

// analytics.subscribe('search_submitted', async event => {});

// // checkout_started event
// const checkout_started = {
//   // ...event_structure
//   data: {
//     checkout: {
//       currencyCode: 'string',
//       lineItems: [
//         {
//           quantity: 0,
//           title: 'string',
//           variant: {
//             // ...product_viewed.data.productVariant
//           },
//         },
//       ],
//       order: {
//         id: 'the id of the order',
//       },
//       shippingAddress: {
//         city: 'string',
//         country: 'string',
//         countryCode: 'string',
//         province: 'string',
//         provinceCode: 'string',
//       },
//       subtotalPrice: {
//         amount: 0,
//         currencyCode: 'string',
//       },
//       totalTax: {
//         amount: 0,
//         currencyCode: 'string',
//       },
//       totalPrice: {
//         amount: 0,
//         currencyCode: 'string',
//       },
//     },
//   },
// };

// analytics.subscribe('checkout_started', async event => {});

// // payment_info_submitted event
// const payment_info_submitted = {
//   // ...event_structure
//   data: {
//     checkout: {
//       // ...checkout_started.data.checkout
//     },
//   },
// };

// analytics.subscribe('payment_info_submitted', async event => {});

// // checkout_completed event
// const checkout_completed = {
//   // ...event_structure
//   data: {
//     checkout: {
//       // ...checkout_started.data.checkout
//     },
//   },
// };

// analytics.subscribe('checkout_completed', async event => {});
