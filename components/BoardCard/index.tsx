import * as React from "react";
import { Button } from "react-bootstrap";
import { XIcon, ThumbsupIcon } from "@primer/octicons-react";
import classNames from "classnames";
import {
  InputEventHandler,
  MouseEventHandler,
} from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import { acall } from "../../utils";
import styles from "./styles.module.scss";

interface BoardCardProps {
  id: number;
  boardId: number;
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
    <div
      {...restProps}
      className={classNames(styles.Card, "p-3", restProps.className)}
    >
      <div
        contentEditable
        ref={divRef}
        onInput={handleInputContent}
        className="mb-2"
      />
      <div className="d-flex justify-content-between">
        <Button variant="success" size="sm" onClick={handleClickVoteUp}>
          <div className="d-inline-block mr-2">{voteCount}</div>
          <span style={{ position: "relative", top: "-1px" }}>
            <ThumbsupIcon ariaLabel="Vote up" verticalAlign="middle" />
          </span>
        </Button>
        <Button variant="danger" size="sm" onClick={handleClickDelete}>
          <span style={{ position: "relative", top: "-1px" }}>
            <XIcon ariaLabel="Delete" verticalAlign="middle" />
          </span>
        </Button>
      </div>
    </div>
  );
}
