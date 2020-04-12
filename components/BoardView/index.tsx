import * as React from "react";
import { Row, Col, Button } from "react-bootstrap";
import Octicon, { Plus } from "@primer/octicons-react";
import { acall } from "../../utils";
import { MouseEventHandler, DragEventHandler } from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import BoardCard from "../BoardCard";

interface BoardViewProps {
  board: BoardModel.BoardData;
}

export default function BoardView({ board }: BoardViewProps): JSX.Element {
  const cards = BoardModel.useBoardCards(board.id);

  function createHandleAddCardClick(sectionIndex: number): MouseEventHandler {
    return (): void => {
      acall(BoardModel.createCard(board.id, sectionIndex));
    };
  }

  function createHandleDragStartCard(
    card: BoardModel.CardData
  ): DragEventHandler {
    return (event: React.DragEvent<HTMLDivElement>): void => {
      event.dataTransfer.setData("application/x.card-id", card.id);
      event.dataTransfer.setData("text/plain", card.content);
    };
  }

  function createHandleDropSection(sectionIndex: number): DragEventHandler {
    return (event): void => {
      const cardId = event.dataTransfer.getData("application/x.card-id");
      acall(BoardModel.updateCard(board.id, cardId, { sectionIndex }));
    };
  }

  const handleDragOverSection: DragEventHandler = (event) => {
    if (event.dataTransfer.types.includes("application/x.card-id")) {
      event.preventDefault();
    }
  };

  return (
    <Row>
      {board.sections.map((section, sectionIndex) => (
        <Col
          className="mb-4 mb-lg-0"
          lg={12 / board.sections.length}
          key={sectionIndex}
          onDragOver={handleDragOverSection}
          onDrop={createHandleDropSection(sectionIndex)}
        >
          <h2 className="h4 text-center mb-3">{section.title}</h2>
          <Button
            block
            type="button"
            className="mb-3"
            size="sm"
            onClick={createHandleAddCardClick(sectionIndex)}
          >
            <span style={{ position: "relative", top: "-1px" }}>
              <Octicon icon={Plus} verticalAlign="middle" ariaLabel="Add" />
            </span>
          </Button>
          {cards
            .filter((card) => card.sectionIndex === sectionIndex)
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
  );
}
