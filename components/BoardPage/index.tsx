import * as React from "react";
import { Container, Row, Col, Button, Card as BsCard } from "react-bootstrap";
import { acall } from "../../utils";
import Footer from "../Footer";
import { OnClickHandler, OnInputHandler } from "../../utils/handler-types";
import * as BoardModel from "../../models/board";

type OnDeleteHandler = () => void;

interface BoardPageProps {
  boardId: string;
}

export default function BoardPage({ boardId }: BoardPageProps): JSX.Element {
  const boardData = BoardModel.useBoard(boardId);
  const cards = BoardModel.useBoardCards(boardId);

  const createHandleAddCardClick: (sectionIndex: number) => OnClickHandler = (
    sectionIndex
  ) => (): void => {
    acall(BoardModel.createCard(boardId, sectionIndex));
  };

  const createHandleInputCardContent: (cardId: string) => OnInputHandler = (
    cardId
  ) => (event): void => {
    const content = (event.target as HTMLDivElement).innerText;

    acall(BoardModel.updateCard(boardId, cardId, { content }));
  };

  const createHandleDeleteCardContent: (cardId: string) => OnDeleteHandler = (
    cardId: string
  ) => (): void => {
    acall(BoardModel.deleteCard(boardId, cardId));
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
                  BoardModel.updateCard(boardId, cardId, { sectionIndex: i })
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
