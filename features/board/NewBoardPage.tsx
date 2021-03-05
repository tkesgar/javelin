import DefaultLayout from "@/components/DefaultLayout";
import { useAuth } from "@/services/firebase/auth";
import { createBoard } from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import style from "./NewBoardPage.module.scss";
import classnames from "classnames";

const MAX_SECTION = 4;

function range(count: number): number[] {
  return Array(count)
    .fill(null)
    .map((e, i) => i + 1);
}

export default function NewBoardPage(): JSX.Element {
  const auth = useAuth();
  const router = useRouter();

  return (
    <DefaultLayout>
      <Container className="my-4">
        <Card className={classnames(style.NewBoardCard, "mx-auto")}>
          <Card.Body>
            <Card.Title>Create a new board</Card.Title>
            <NewBoardForm
              onSubmit={(value) => {
                if (!auth) {
                  throw new Error(`User is not authenticated`);
                }

                (async () => {
                  const boardId = await createBoard({
                    userId: auth.uid,
                    ...value,
                  });
                  await router.push(`/board/${boardId}`);
                })().catch((error) => alert(error.message));
              }}
            />
          </Card.Body>
        </Card>
      </Container>
    </DefaultLayout>
  );
}

interface NewBoardFormProps {
  onSubmit: (value: {
    title: string;
    description: string;
    sectionTitles: string[];
  }) => void;
}

function NewBoardForm({ onSubmit }: NewBoardFormProps): JSX.Element {
  const [inputTitle, setInputTitle] = React.useState("");
  const [inputDescription, setInputDescription] = React.useState("");
  const [numberSections, setNumberSections] = React.useState(1);
  const [inputSectionTitles, setInputSectionTitles] = React.useState(
    Array<string>(MAX_SECTION).fill("")
  );

  return (
    <Form
      onSubmit={(evt) => {
        evt.preventDefault();

        onSubmit({
          title: inputTitle.trim(),
          description: inputDescription.trim() || null,
          sectionTitles: inputSectionTitles
            .slice(0, numberSections)
            .map((input) => input.trim()),
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
        <Form.Label srOnly>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          maxLength={160}
          placeholder="Description"
          value={inputDescription}
          onChange={(evt) => setInputDescription(evt.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="createBoard_sectionCount" className="my-3">
        <Form.Label>Number of sections</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max={MAX_SECTION}
          step="1"
          value={numberSections}
          required
          onChange={(evt) => setNumberSections(Number(evt.target.value) || 1)}
          style={{ maxWidth: "8rem" }}
        />
      </Form.Group>
      {range(numberSections).map((index) => (
        <Form.Group
          key={index}
          controlId={`createBoard_sectionTitle${index}`}
          className="my-3"
        >
          <Form.Label srOnly>Section title {index}</Form.Label>
          <Form.Control
            type="text"
            maxLength={60}
            placeholder={`Section title ${index}`}
            required
            value={inputSectionTitles[index - 1]}
            onChange={(evt) =>
              setInputSectionTitles(
                inputSectionTitles.map((title, i) =>
                  i === index - 1 ? evt.target.value : title
                )
              )
            }
          />
        </Form.Group>
      ))}
      <Button type="submit" variant="primary" block>
        Create board
      </Button>
    </Form>
  );
}
