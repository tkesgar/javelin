import DefaultLayout from "@/components/DefaultLayout";
import Link from "next/link";
import * as React from "react";
import { Button, Card, Container } from "react-bootstrap";
import { Board, getMyBoards } from "@/services/firebase/board";
import useSWR from "swr";
import { Auth, useAuth } from "@/services/firebase/auth";
import { useRouter } from "next/router";

export default function HomePage(): JSX.Element {
  const auth = useAuth();
  const router = useRouter();
  const { data: myBoards, error: myBoardsError } = useSWR<Board[]>(
    (auth as Auth)?.uid,
    getMyBoards
  );

  React.useEffect(() => {
    if (!myBoardsError) {
      return;
    }

    console.error(myBoardsError);
  }, [myBoardsError]);

  return (
    <DefaultLayout>
      <Container className="my-4">
        <h1 className="mb-4">My boards</h1>
        {(myBoards || null) &&
          (myBoards.length === 0 ? (
            <>
              <p className="text-muted">
                You currently do not have any boards.
              </p>
              <Link href="/new/board" passHref>
                <Button variant="primary">Create a new board</Button>
              </Link>
            </>
          ) : (
            myBoards.map((board) => (
              <Card
                key={board.id}
                className="mb-3"
                role="button"
                onClick={() => {
                  router.push(`/board/${board.id}`);
                }}
              >
                <Card.Body>
                  <Card.Title>{board.title}</Card.Title>
                  {board.description && (
                    <p className="text-muted">{board.description}</p>
                  )}
                </Card.Body>
              </Card>
            ))
          ))}
      </Container>
    </DefaultLayout>
  );
}
