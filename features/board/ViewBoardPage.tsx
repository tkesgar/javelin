import DefaultLayout from "@/components/DefaultLayout";
import { useBoard } from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import { Container } from "react-bootstrap";

export default function ViewBoardPage(): JSX.Element {
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);

  return (
    <DefaultLayout>
      <Container className="my-4">
        <h1 className="border-bottom border-light mb-4">Hello board!</h1>
        <pre>{JSON.stringify(board, null, 2)}</pre>
      </Container>
    </DefaultLayout>
  );
}
