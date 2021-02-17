import DefaultLayout from "@/components/DefaultLayout";
import { signIn } from "@/services/firebase/auth";
import * as React from "react";
import { Button } from "react-bootstrap";

export default function LandingPage(): JSX.Element {
  return (
    <DefaultLayout>
      <div className="my-5 text-center">
        <Button
          size="lg"
          onClick={() => {
            // TODO Handle error (user canceled sign in)
            signIn();
          }}
        >
          Log in with Google
        </Button>
      </div>
    </DefaultLayout>
  );
}
