import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import "@/styles/main.scss";
import { AuthProvider } from "@/services/firebase/auth";
import { initializeApp } from "@/services/firebase";

if (typeof window !== "undefined") {
  initializeApp();
}

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Comic+Neue&family=Inconsolata&family=Inter:wght@300;400;700&display=swap"
        />

        {/* Created using https://favicon.io/favicon-generator/ */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <title>javelin</title>
        <meta
          name="description"
          content="javelin is an app where people can arrange notes in a number of columns."
        />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}
