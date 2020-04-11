import * as React from "react";
import BoardPage from "../../components/BoardPage";
import { useRouter } from "next/router";

export default function Index(): JSX.Element {
  const router = useRouter();

  const boardId = router.query.boardId as string;
  if (!boardId) {
    return null;
  }

  return <BoardPage boardId={boardId} />;
}
