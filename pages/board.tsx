import * as React from "react";
import BoardPage from "../components/BoardPage";
import { useRouter } from "next/router";

export default function Board(): JSX.Element {
  const router = useRouter();

  const boardId = router.query.id as string;
  if (!boardId) {
    return null;
  }

  return <BoardPage boardId={boardId} />;
}
