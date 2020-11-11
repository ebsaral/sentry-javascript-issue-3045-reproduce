import * as Sentry from "@sentry/node";
import { BrowserOptions } from "@sentry/browser";
import { RewriteFrames } from "@sentry/integrations";
import getConfig from "next/config";
import { Integration } from "@sentry/types";
import { isServer } from "./general";

function initSentry() {
  const config = getConfig();
  const distDir = `${config.serverRuntimeConfig.rootDir}/.next`;

  const integrations = (defaults: Integration[]) => {
    const customIntegrations = [
      new RewriteFrames({
        iteratee: (frame) => {
          frame.filename = frame.filename?.replace(distDir, "app:///_next");

          return frame;
        },
      }),
    ];

    return [...defaults, ...customIntegrations];
  };

  const sentryOptions = {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_STAGE,
    enabled: true,
    //defaultIntegrations: false as false,
    integrations,
    tracesSampleRate: 0.3,
    beforeSend(event: Sentry.Event, hint: Sentry.EventHint) {
      console.log("Sending:");
      console.log(event);
      const error = hint.originalException as Error;

      const errorMessage = typeof error === "string" ? error : error?.message;

      if (!isServer()) {
        const hasFBCLID = window.location.search.includes("fbclid");
        const isIllegalInvocationError = errorMessage?.match(
          /Illegal invocation/i
        );
        if (hasFBCLID && isIllegalInvocationError) {
          return null;
        }
      }

      if (errorMessage?.match(/\/_next\//)) {
        return null;
      }

      return event;
    },
    release: "preview",
  };

  if (!isServer()) {
    (sentryOptions as BrowserOptions).denyUrls = [
      "https://connect.facebook.net/en_US/iab.autofill.payment.js",
    ];
  }
  console.log(sentryOptions);
  Sentry.init(sentryOptions);
}

export const withSentry = (fn: Function) => {
  initSentry();
  return function() {
    return fn.apply(this, arguments);
  };
};
