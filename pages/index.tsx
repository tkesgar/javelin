import * as React from "react";
import LandingPage from "@/features/landing-page/LandingPage";
import { useAuthorize } from "@/services/firebase/auth";
import { useRouter } from "next/dist/client/router";

export default function Index(): JSX.Element {
  const router = useRouter();
  const isLogin = useAuthorize();

  React.useEffect(() => {
    if (isLogin === null) {
      return;
    }

    if (isLogin) {
      router.replace("/home");
    }
  }, [isLogin, router]);

  return <LandingPage />;
}
