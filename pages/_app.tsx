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
      </Head>
      <Component {...pageProps} />
    </>
  );
}
