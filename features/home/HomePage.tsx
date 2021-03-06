import DefaultLayout from "@/components/DefaultLayout";
import Link from "next/link";
import * as React from "react";
import { Button, Card, Container, Spinner } from "react-bootstrap";
import { Board, getMyBoards } from "@/services/firebase/board";
import useSWR from "swr";
import { Auth, signIn, useAuth } from "@/services/firebase/auth";
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
      {auth === false ? (
        <Spinner animation="border" className="d-block mx-auto my-5" />
      ) : auth ? (
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
              <>
                <Link href="/new/board" passHref>
                  <Button variant="primary" className="mb-3">
                    Create a new board
                  </Button>
                </Link>
                {myBoards.map((board) => (
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
                ))}
              </>
            ))}
        </Container>
      ) : (
        <Container className="my-5">
          <h1>You are not logged in.</h1>
          <p>You need to log in to create boards.</p>
          <Button
            type="button"
            variant="primary"
            className="mb-3"
            onClick={() => {
              // TODO Handle error (user canceled sign in)
              signIn();
            }}
          >
            Log in with Google account
          </Button>
        </Container>
      )}
    </DefaultLayout>
  );
}
