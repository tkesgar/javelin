import * as React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { PlusIcon } from "@primer/octicons-react";
import { acall } from "../../utils";
import { MouseEventHandler, DragEventHandler } from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import BoardCard from "../BoardCard";
import { useRouter } from "next/router";

interface BoardViewProps {
  board: BoardModel.BoardData;
}

export default function BoardView({ board }: BoardViewProps): JSX.Element {
  const router = useRouter();
  const cards = BoardModel.useBoardCards(board.slug);

  function createHandleAddCardClick(sectionId: number): MouseEventHandler {
    return (): void => {
      acall(BoardModel.createCard(sectionId));
    };
  }

  function createHandleDragStartCard(
    card: BoardModel.CardData
  ): DragEventHandler {
    return (event: React.DragEvent<HTMLDivElement>): void => {
      event.dataTransfer.setData("application/x.card-id", card.id.toString(10));
      event.dataTransfer.setData("text/plain", card.content);
    };
  }

  function createHandleDropSection(sectionId: number): DragEventHandler {
    return (event): void => {
      const cardId = event.dataTransfer.getData("application/x.card-id");
      acall(BoardModel.updateCard(parseInt(cardId, 10), { sectionId }));
    };
  }

  const handleDragOverSection: DragEventHandler = (event) => {
    if (event.dataTransfer.types.includes("application/x.card-id")) {
      event.preventDefault();
    }
  };

  const handleClickDeleteBoard: MouseEventHandler = (): void => {
    if (
      !confirm(
        "Are you sure you want to delete this board? This cannot be undone."
      )
    ) {
      return;
    }

    acall(async () => {
      const boardTitle = board.title;

      await router.push("/");
      await BoardModel.removeBoard(board.slug);

      alert(`Board ${boardTitle} deleted.`);
    });
  };

  return (
    <>
      <Row className="mb-5">
        {board.sections.map((section) => (
          <Col
            className="mb-4 mb-lg-0"
            lg={12 / board.sections.length}
            key={section.id}
            onDragOver={handleDragOverSection}
            onDrop={createHandleDropSection(section.id)}
          >
            <h2 className="h4 text-center mb-3">{section.title}</h2>
            <Button
              block
              type="button"
              className="mb-3"
              size="sm"
              onClick={createHandleAddCardClick(section.id)}
            >
              <span style={{ position: "relative", top: "-1px" }}>
                <PlusIcon verticalAlign="middle" />
              </span>
            </Button>
            {cards
              .filter((card) => card.sectionId === section.id)
              .map((card) => (
                <BoardCard
                  key={card.id}
                  id={card.id}
                  boardId={board.id}
                  content={card.content}
                  voteCount={card.voteCount}
                  className="mb-2"
                  draggable
                  onDragStart={createHandleDragStartCard(card)}
                />
              ))}
          </Col>
        ))}
      </Row>
      <div className="text-center">
        {cards.length > 0 ? (
          <div className="text-muted">
            To delete this board, you need to remove all cards first.
          </div>
        ) : (
          <Button type="button" variant="link" onClick={handleClickDeleteBoard}>
            Delete board
          </Button>
        )}
      </div>
    </>
  );
}
