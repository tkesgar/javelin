import * as React from "react";
import * as firebase from "firebase/app";
import { Form, Button, Card } from "react-bootstrap";
import { acall, range } from "../../utils";
import { useRouter } from "next/router";

type OnSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
type OnChangeHandler = (event: React.FormEvent<HTMLInputElement>) => void;

const DEFAULT_SECTIONS_COUNT = 3;

export default function CreateBoardCard(): JSX.Element {
  const [sectionsCount, setSectionsCount] = React.useState(
    DEFAULT_SECTIONS_COUNT
  );
  const router = useRouter();

  const handleSubmit: OnSubmitHandler = (event) => {
    event.preventDefault();

    const inputTitle = document.querySelector(
      "#createBoardTitle"
    ) as HTMLInputElement;
    const title = inputTitle.value;

    const sectionTitles = range(1, sectionsCount).map((i) => {
      const inputSectionTitle = document.querySelector(
        `#createBoardSectionTitle${i}`
      ) as HTMLInputElement;
      const sectionTitle = inputSectionTitle.value;

      return sectionTitle;
    });

    acall(async () => {
      const db = firebase.firestore();

      const docRef = await db.collection("boards").add({
        title,
        sections: sectionTitles.map((title) => ({ title })),
      });

      await router.push(`/board?id=${docRef.id}`);
    });
  };

  const handleChangeSectionsCount: OnChangeHandler = (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    setSectionsCount(value);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title className="mb-4 text-center">Create a new board</Card.Title>
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Form.Group controlId="createBoardTitle">
              <Form.Label>Board title</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Board title"
                maxLength={40}
              />
            </Form.Group>
          </div>
          <div className="mb-4">
            <Form.Group controlId="createBoardSectionsCount">
              <Form.Label>Number of sections</Form.Label>
              <Form.Control
                required
                type="number"
                placeholder="Number of sections"
                defaultValue={DEFAULT_SECTIONS_COUNT}
                min="1"
                max="4"
                onChange={handleChangeSectionsCount}
              />
            </Form.Group>
          </div>
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
            Create new board
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
