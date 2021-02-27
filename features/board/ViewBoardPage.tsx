import DefaultLayout from "@/components/DefaultLayout";
import { useBoard } from "@/services/firebase/board";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Container, Spinner } from "react-bootstrap";
import { Settings } from "react-feather";

export default function ViewBoardPage(): JSX.Element {
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);

  return (
    <DefaultLayout>
      <Container className="my-4">
        {board ? (
          <div className="border-bottom border-light pb-3 mb-4 d-flex">
            <div className="flex-fill">
              <h1>{board.title}</h1>
              <div className="text-muted mb-3">{board.description}</div>
            </div>
            <div className="ml-3">
              <Link href={`/${router.query.boardId}/settings`} passHref>
                <Button variant="secondary">
                  <Settings size="16" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Spinner animation="border" className="d-block mx-auto my-5" />
        )}
      </Container>
    </DefaultLayout>
  );
}
