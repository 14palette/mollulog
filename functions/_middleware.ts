import { sentryPagesPlugin } from "@sentry/cloudflare";

export const onRequest = [
  sentryPagesPlugin(() => ({
    dsn: "https://dd5a730f699e05eb0fceda485567b5d2@o4509222848233472.ingest.us.sentry.io/4509223975780352",

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/cloudflare/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  })),
];
