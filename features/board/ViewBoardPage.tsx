import DefaultLayout from "@/components/DefaultLayout";
import { useBoard } from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import { Container, Spinner } from "react-bootstrap";

export default function ViewBoardPage(): JSX.Element {
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);

  return (
    <DefaultLayout>
      <Container className="my-4">
        {board ? (
          <div className="border-bottom border-light mb-4 text-center">
            <h1>{board.title}</h1>
            <span className="text-muted">{board.description}</span>
          </div>
        ) : (
          <Spinner animation="border" className="d-block mx-auto my-5" />
        )}
      </Container>
    </DefaultLayout>
  );
}
