import React, { useEffect } from "react";
import Router from "next/router";
import Head from "next/head";
import { AppProps } from "next/app";

import { isServer } from "~/utils/general";

import { withSentry } from "~/utils/sentry";

export default withSentry(function MyApp({
  Component,
  pageProps,
  err,
}: AppProps & { err: Error }) {
  return (
    <>
      <Head>
        {!isServer() && (
          <script src="https://connect.facebook.net/en_US/iab.autofill.payment.js" />
        )}
      </Head>

      <Component {...pageProps} err={err} />
    </>
  );
});
