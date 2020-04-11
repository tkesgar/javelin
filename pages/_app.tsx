import * as React from "react";
import * as firebase from "firebase/app";
import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/main.scss";
import "firebase/firestore";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  React.useEffect(() => {
    firebase.initializeApp({
      apiKey: "AIzaSyATXzMK0QAdf06YBZjvWpFKQBwB8Dy1LEE",
      authDomain: "javelin-84678.firebaseapp.com",
      databaseURL: "https://javelin-84678.firebaseio.com",
      projectId: "javelin-84678",
      storageBucket: "javelin-84678.appspot.com",
      messagingSenderId: "889209996417",
      appId: "1:889209996417:web:dfc0e04fc8a69ffb6d3980",
    });
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
