import * as React from "react";
import { Button, Card } from "react-bootstrap";
import Octicon, { X } from "@primer/octicons-react";
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
  [key: string]: unknown;
}

export default function BoardCard({
  id,
  boardId,
  content = "",
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

  return (
    <Card {...restProps}>
      <Card.Body>
        <div contentEditable ref={divRef} onInput={handleInputContent} />
      </Card.Body>
      <Card.Footer>
        <Button
          className="d-block ml-auto"
          variant="danger"
          onClick={handleClickDelete}
        >
          <span style={{ position: "relative", top: "-2px" }}>
            <Octicon icon={X} ariaLabel="Delete" verticalAlign="middle" />
          </span>
        </Button>
      </Card.Footer>
    </Card>
  );
}
