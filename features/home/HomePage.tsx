import DefaultLayout from "@/components/DefaultLayout";
import * as React from "react";
import { Container } from "react-bootstrap";

export default function HomePage(): JSX.Element {
  return (
    <DefaultLayout>
      <Container className="my-3">
        <h1>Home page!</h1>
        <p>It works!</p>
      </Container>
    </DefaultLayout>
  );
}
