import * as React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { PlusIcon } from "@primer/octicons-react";
import { acall } from "../../utils";
import { MouseEventHandler, DragEventHandler } from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import BoardCard from "../BoardCard";
import { useRouter } from "next/router";
import { mutate } from "swr";

interface BoardViewProps {
  board: BoardModel.BoardData;
}

export default function BoardView({ board }: BoardViewProps): JSX.Element {
  const router = useRouter();
  const cards = BoardModel.useBoardCards(board.slug);

  function createHandleDragStartCard(
    card: BoardModel.CardData
  ): DragEventHandler {
    return (event: React.DragEvent<HTMLDivElement>): void => {
      event.dataTransfer.setData("application/x.card-id", card.id);
      event.dataTransfer.setData("text/plain", card.content);
    };
  }

  function createHandleDropSection(sectionId: string): DragEventHandler {
    return (event): void => {
      const strCardId = event.dataTransfer.getData("application/x.card-id");
      acall(async () => {
        const cardId = strCardId;
        await BoardModel.updateCardSection(cardId, sectionId);
        await mutate(`/board/${board.slug}`);
      });
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
              onClick={(): void => {
                acall(async () => {
                  const card = await BoardModel.createCard(section.id);
                  await mutate(`/board/${board.slug}`);
                });
              }}
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
                  content={card.content}
                  voteCount={card.vote}
                  className="mb-2"
                  draggable
                  onDragStart={createHandleDragStartCard(card)}
                  onDelete={(): void => {
                    acall(mutate(`/board/${board.slug}`));
                  }}
                  onIncrementVote={(): void => {
                    console.log(card);
                    acall(mutate(`/board/${board.slug}`));
                  }}
                />
              ))}
          </Col>
        ))}
      </Row>
      <div className="text-center">
        <Button type="button" variant="link" onClick={handleClickDeleteBoard}>
          Delete board
        </Button>
      </div>
    </>
  );
}
