import React from "react";
import Document, { Head, Main, Html, NextScript } from "next/document";

export default class BaseDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

BaseDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => {
        return <App {...props} />;
      },
    });

  return await Document.getInitialProps(ctx);
};
