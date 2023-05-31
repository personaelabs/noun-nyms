// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://7ba02ad0a8cd461588447277236ede1c@o4505239028498432.ingest.sentry.io/4505239506649088',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  integrations: [
    new Sentry.Integrations.RequestData({
      include: {
        cookies: false, // default: true,
        data: false, // default: true,
        headers: false, // default: true,
        ip: false, // default: false,
        query_string: false, // default: true,
        url: false, // default: true,
      },
    }),
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
