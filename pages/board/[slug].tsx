import * as React from "react";
import BoardPage from "../../components/BoardPage";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

export default function Board(): JSX.Element {
  const router = useRouter();

  const slug = router.query.slug as string;
  if (!slug) {
    return <ErrorPage statusCode={404} />;
  }

  return <BoardPage slug={slug} />;
}
