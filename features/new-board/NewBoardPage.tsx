import DefaultLayout from "@/components/DefaultLayout";
import { createBoard } from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Container, Form } from "react-bootstrap";

export default function NewBoardPage(): JSX.Element {
  const router = useRouter();

  return (
    <DefaultLayout>
      <Container className="my-4">
        <h1 className="border-bottom border-light mb-4">Create a new board</h1>
        <NewBoardForm
          onSubmit={(value) => {
            (async () => {
              const boardId = await createBoard(value);
              await router.push(`/board/${boardId}`);
            })().catch((error) => alert(error.message));
          }}
        />
      </Container>
    </DefaultLayout>
  );
}

interface NewBoardFormProps {
  onSubmit: (value: { title: string; description: string }) => void;
}

function NewBoardForm({ onSubmit }: NewBoardFormProps): JSX.Element {
  const [inputTitle, setInputTitle] = React.useState("");
  const [inputDescription, setInputDescription] = React.useState("");

  return (
    <Form
      onSubmit={(evt) => {
        evt.preventDefault();

        const title = inputTitle.trim();
        const description = inputDescription.trim() || null;

        onSubmit({
          title,
          description,
        });
      }}
    >
      <Form.Group controlId="createBoard_title" className="my-3">
        <Form.Label srOnly>Title</Form.Label>
        <Form.Control
          type="text"
          maxLength={60}
          placeholder="Title"
          required
          value={inputTitle}
          onChange={(evt) => setInputTitle(evt.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="createBoard_description" className="my-3">
        <Form.Label srOnly>Title</Form.Label>
        <Form.Control
          as="textarea"
          maxLength={160}
          placeholder="Description"
          value={inputDescription}
          onChange={(evt) => setInputDescription(evt.target.value)}
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        Create board
      </Button>
    </Form>
  );
}
