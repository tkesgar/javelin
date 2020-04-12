import * as React from "react";
import { Button, Card } from "react-bootstrap";
import Octicon, { X, Thumbsup } from "@primer/octicons-react";
import {
  InputEventHandler,
  MouseEventHandler,
} from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import { acall } from "../../utils";

interface BoardCardProps {
  id: string;
  boardId: string;
  content?: string;
  voteCount?: number;
  [key: string]: unknown;
}

export default function BoardCard({
  id,
  boardId,
  content = "",
  voteCount = 0,
  ...restProps
}: BoardCardProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    divRef.current.innerText = content;
  }, []);

  const handleInputContent: InputEventHandler<HTMLDivElement> = (
    event
  ): void => {
    const content = (event.target as HTMLDivElement).innerText;

    acall(BoardModel.updateCard(boardId, id, { content }));
  };

  const handleClickDelete: MouseEventHandler = (): void => {
    acall(BoardModel.deleteCard(boardId, id));
  };

  const handleClickVoteUp: MouseEventHandler = (): void => {
    acall(BoardModel.incrementVoteCard(boardId, id));
  };

  return (
    <Card {...restProps}>
      <Card.Body>
        <div contentEditable ref={divRef} onInput={handleInputContent} />
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-between">
          <Button variant="success" size="sm" onClick={handleClickVoteUp}>
            <div className="d-inline-block mr-2">{voteCount}</div>
            <span style={{ position: "relative", top: "-1px" }}>
              <Octicon
                icon={Thumbsup}
                ariaLabel="Vote up"
                verticalAlign="middle"
              />
            </span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleClickDelete}>
            <span style={{ position: "relative", top: "-1px" }}>
              <Octicon icon={X} ariaLabel="Delete" verticalAlign="middle" />
            </span>
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}
