import React from "react";
import * as Sentry from "@sentry/node";
import { NextPageContext } from "next";
import NextErrorComponent, { ErrorProps } from "next/error";
import { isServer } from "~/utils/general";

interface IProps extends ErrorProps {
  err: Error | null;
}

function captureMessage(error: Error, statusCode?: number) {
  if (statusCode) {
    Sentry.setTag("error.code", String(statusCode));
  }
  Sentry.setTag("source", isServer() ? "lambda" : "static");

  statusCode === 404
    ? Sentry.captureMessage(error.message)
    : Sentry.captureException(error);
}

export default function CustomErrorPage({ err, statusCode }: IProps) {
  return <div>Error Page</div>;
}

CustomErrorPage.getInitialProps = async (ctx: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(ctx);

  const isNextjsBug = !ctx.err;
  if (isNextjsBug || isServer()) {
    captureMessage(
      ctx.err ??
        new Error(
          `_error.js getInitialProps missing data at path: ${ctx.asPath}`
        ),
      ctx.res?.statusCode
    );
    await Sentry.flush(2000);

    return { ...errorInitialProps, err: null };
  }

  return { ...errorInitialProps, err: ctx.err };
};
