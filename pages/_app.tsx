import * as React from "react";
import * as firebase from "firebase/app";
import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/main.scss";
import "firebase/firestore";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  React.useEffect(() => {
    firebase.initializeApp(firebaseConfig);
  }, []);

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
        <link rel="manifest" href="/site.webmanifest" />

        <title>javelin | Interactive Notes</title>
        <meta
          name="description"
          content="javelin is a web app where people can arrange notes in a number of columns, useful for activities such as sprint retrospective."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
