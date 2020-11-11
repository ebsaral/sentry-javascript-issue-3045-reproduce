const withSourceMaps = require("@zeit/next-source-maps")();
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const path = require("path");
const withTM = require("next-transpile-modules")([
  "cookies-next",
  "lru-cache",
  "react-intl",
  "react-in-viewport",
  "split-on-first",
  "strict-uri-encode",
  "query-string",
  "yallist",
]);
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const {
  SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  APP_STAGE,
} = process.env;

let config = {
  env: {
    APP_STAGE: process.env.APP_STAGE,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  },
  serverRuntimeConfig: {
    rootDir: __dirname,
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|png|jpg|gif)$/,
      use: {
        loader: "url-loader",
        options: {
          limit: 100000,
          name: "[name].[ext]",
        },
      },
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            memo: true,
          },
        },
      ],
    });

    if (!options.isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser";
    }

    config.resolve.alias["~"] = path.resolve(__dirname);

    if (
      SENTRY_DSN &&
      SENTRY_ORG &&
      SENTRY_PROJECT &&
      SENTRY_AUTH_TOKEN &&
      APP_STAGE !== "development"
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          authToken: SENTRY_AUTH_TOKEN,
          org: SENTRY_ORG,
          project: SENTRY_PROJECT,
          include: ".next",
          ignore: ["node_modules"],
          stripPrefix: ["webpack://_N_E/"],
          urlPrefix: "~/_next",
          release: VERCEL_GITLAB_COMMIT_SHA || "preview",
        })
      );
    }
    return config;
  },
};

config = withTM(config);
config = withBundleAnalyzer(config);
config = withSourceMaps(config);

module.exports = config;
