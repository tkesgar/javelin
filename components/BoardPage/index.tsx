import * as React from "react";
import * as firebase from "firebase/app";
import { Container, Row, Col, Button, Card as BsCard } from "react-bootstrap";
import { acall } from "../../utils";
import Footer from "../Footer";
import { OnClickHandler, OnInputHandler } from "../../utils/handler-types";

type OnDeleteHandler = () => void;

interface BoardPageProps {
  boardId: string;
}

interface Card {
  id: string;
  sectionIndex: number;
  content: string;
}

interface Section {
  title: string;
}

interface Board {
  title: string;
  sections: Section[];
}

export default function BoardPage({ boardId }: BoardPageProps): JSX.Element {
  const db = firebase.firestore();

  const [boardData, setBoardData] = React.useState<Board>(null);
  const [cards, setCards] = React.useState<Card[]>([]);
  React.useEffect(() => {
    const unsubscribeBoard = db
      .collection("boards")
      .doc(boardId)
      .onSnapshot((doc) => {
        const boardData = doc.data();
        console.log(boardData);
        setBoardData(boardData as Board);
      });

    const unsubscribeCards = db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .onSnapshot((docs) => {
        const cards = [];
        docs.forEach((doc) => {
          cards.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        console.log(cards);
        setCards(cards);
      });

    return (): void => {
      unsubscribeBoard();
      unsubscribeCards();
    };
  }, []);

  const createHandleAddCardClick: (sectionIndex: number) => OnClickHandler = (
    sectionIndex
  ) => (): void => {
    db.collection("boards").doc(boardId).collection("cards").add({
      sectionIndex,
      content: "",
    });

    console.log(`Add new card to section ${sectionIndex}`);
  };

  const createHandleInputCardContent: (cardId: string) => OnInputHandler = (
    cardId
  ) => (event): void => {
    const content = (event.target as HTMLDivElement).innerText;

    acall(
      db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(cardId)
        .update({
          content,
        })
    );

    console.log(`update card ${cardId} content: ${content}`);
  };

  const createHandleDeleteCardContent: (cardId: string) => OnDeleteHandler = (
    cardId: string
  ) => (): void => {
    acall(
      db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(cardId)
        .delete()
    );

    console.log(`Delete card ${cardId}`);
  };

  if (!boardData) {
    return null;
  }

  return (
    <>
      <Container className="my-5">
        <h1 className="text-center mb-5">{boardData.title}</h1>
        <Row>
          {boardData.sections.map((section, i) => (
            <Col
              className="mb-4 mb-md-0"
              md={12 / boardData.sections.length}
              key={i}
              onDragOver={(event: React.DragEvent<HTMLDivElement>): void => {
                event.preventDefault();
              }}
              onDrop={(event: React.DragEvent<HTMLDivElement>): void => {
                const cardId = event.dataTransfer.getData(
                  "application/x.card-id"
                );

                acall(
                  db
                    .collection("boards")
                    .doc(boardId)
                    .collection("cards")
                    .doc(cardId)
                    .update({ sectionIndex: i })
                );
              }}
            >
              <h2 className="text-center">{section.title}</h2>
              <Button block type="button" onClick={createHandleAddCardClick(i)}>
                Add
              </Button>
              {cards
                .filter((card) => card.sectionIndex === i)
                .map((card) => (
                  <RetroCard
                    key={card.id}
                    initialContent={card.content}
                    onInput={createHandleInputCardContent(card.id)}
                    onClickDelete={createHandleDeleteCardContent(card.id)}
                    draggable
                    onDragStart={(
                      event: React.DragEvent<HTMLDivElement>
                    ): void => {
                      event.dataTransfer.setData(
                        "application/x.card-id",
                        card.id
                      );
                      event.dataTransfer.setData("text/plain", card.content);
                    }}
                  />
                ))}
            </Col>
          ))}
        </Row>
      </Container>
      <div className="mt-5 py-4 border-top border-secondary">
        <Footer />
      </div>
    </>
  );
}

interface RetroCardProps {
  onInput: OnInputHandler;
  initialContent?: string;
  onClickDelete: () => void;
  [key: string]: unknown;
}

function RetroCard({
  initialContent = "",
  onInput,
  onClickDelete,
  ...restProps
}: RetroCardProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    divRef.current.innerText = initialContent;
  }, []);

  return (
    <BsCard {...restProps}>
      <BsCard.Body>
        <div contentEditable ref={divRef} onInput={onInput} />
      </BsCard.Body>
      <BsCard.Footer>
        <Button onClick={onClickDelete}>Delete</Button>
      </BsCard.Footer>
    </BsCard>
  );
}
