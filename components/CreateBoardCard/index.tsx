import * as React from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useRouter } from "next/router";
import { acall, range, getInputValue, clamp } from "../../utils";
import { createBoard } from "../../models/board";
import { FormEventHandler } from "../../utils/handler-types";

const MIN_SECTIONS_COUNT = 1;
const MAX_SECTIONS_COUNT = 4;
const DEFAULT_SECTIONS_COUNT = 3;

export default function CreateBoardCard(): JSX.Element {
  const [sectionsCount, setSectionsCount] = React.useState(
    DEFAULT_SECTIONS_COUNT
  );
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const title = getInputValue("#createBoardTitle");
    const sections = range(1, sectionsCount).map((i) => ({
      title: getInputValue(`#createBoardSectionTitle${i}`),
    }));

    acall(async () => {
      const boardId = await createBoard({
        title,
        sections: sections,
      });

      await router.push(`/board?id=${boardId}`);
    });
  };

  const handleChangeSectionsCount: FormEventHandler<HTMLInputElement> = (
    event
  ) => {
    const input = event.target as HTMLInputElement;
    const value = clamp(
      Number(input.value),
      MIN_SECTIONS_COUNT,
      MAX_SECTIONS_COUNT
    );

    setSectionsCount(value);
    input.value = String(value);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-4 text-center">Create a new board</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="createBoardTitle">
            <Form.Label>Board title</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Board title"
              maxLength={40}
            />
          </Form.Group>
          <Form.Group controlId="createBoardSectionsCount">
            <Form.Label>Number of sections</Form.Label>
            <Form.Control
              required
              type="number"
              placeholder="Number of sections"
              defaultValue={DEFAULT_SECTIONS_COUNT}
              min={MIN_SECTIONS_COUNT}
              max={MAX_SECTIONS_COUNT}
              onChange={handleChangeSectionsCount}
              style={{ width: "5rem" }}
            />
          </Form.Group>
          <div className="mb-4">
            {range(1, sectionsCount).map((i) => (
              <Form.Group key={i} controlId={`createBoardSectionTitle${i}`}>
                <Form.Label srOnly>Title for section {i}</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder={`Title for section ${i}`}
                  maxLength={40}
                />
              </Form.Group>
            ))}
          </div>
          <Button block variant="primary" type="submit">
            Create
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
