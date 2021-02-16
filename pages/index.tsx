import { signIn, signOut, useAuth } from "@/services/firebase/auth";
import * as React from "react";

export default function Index(): JSX.Element {
  const auth = useAuth();

  return (
    <>
      <h1>Hello world!</h1>
      <p>It works!</p>
      {auth !== false ? (
        <>
          <pre>{JSON.stringify(auth, null, 2)}</pre>
          <button
            type="button"
            onClick={() => {
              auth ? signOut() : signIn();
            }}
          >
            {auth ? "Log out" : "Log in"}
          </button>
        </>
      ) : null}
    </>
  );
}
