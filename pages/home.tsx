import * as React from "react";
import HomePage from "@/features/home/HomePage";
import { useAuthorize } from "@/services/firebase/auth";
import { useRouter } from "next/dist/client/router";

export default function Home(): JSX.Element {
  const router = useRouter();
  const isLogin = useAuthorize();

  React.useEffect(() => {
    if (isLogin === null) {
      return;
    }

    if (!isLogin) {
      router.replace("/");
    }
  }, [isLogin, router]);

  return isLogin ? <HomePage /> : null;
}
