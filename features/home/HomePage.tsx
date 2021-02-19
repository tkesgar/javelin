import DefaultLayout from "@/components/DefaultLayout";
import Link from "next/link";
import * as React from "react";
import { Button, Container } from "react-bootstrap";

export default function HomePage(): JSX.Element {
  return (
    <DefaultLayout>
      <Container className="my-4">
        <h1>My boards</h1>
        <p className="text-muted">You currently do not have any boards.</p>
        <Link href="/new/board" passHref>
          <Button variant="primary">Create a new board</Button>
        </Link>
      </Container>
    </DefaultLayout>
  );
}
