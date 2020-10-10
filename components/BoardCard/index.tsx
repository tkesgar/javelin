import * as React from "react";
import { Button } from "react-bootstrap";
import { XIcon, ThumbsupIcon } from "@primer/octicons-react";
import classNames from "classnames";
import { InputEventHandler } from "../../utils/handler-types";
import * as BoardModel from "../../models/board";
import { acall } from "../../utils";
import styles from "./styles.module.scss";

interface BoardCardProps {
  id: string;
  content?: string;
  voteCount?: number;
  onDelete?: () => void;
  onIncrementVote?: () => void;
  [key: string]: unknown;
}

export default function BoardCard({
  id,
  content = "",
  voteCount = 0,
  onDelete,
  onIncrementVote,
  ...restProps
}: BoardCardProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    divRef.current.innerText = content;
  });

  const handleInputContent: InputEventHandler<HTMLDivElement> = (
    event
  ): void => {
    const content = (event.target as HTMLDivElement).innerText;

    acall(BoardModel.updateCard(id, { content }));
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
        <Button
          variant="success"
          size="sm"
          onClick={(): void => {
            acall(async () => {
              await BoardModel.incrementVoteCard(id);
              if (onIncrementVote) {
                onIncrementVote();
              }
            });
          }}
        >
          <div className="d-inline-block mr-2">{voteCount}</div>
          <span style={{ position: "relative", top: "-1px" }}>
            <ThumbsupIcon verticalAlign="middle" />
          </span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={(): void => {
            acall(async () => {
              await BoardModel.deleteCard(id);
              if (onDelete) {
                onDelete();
              }
            });
          }}
        >
          <span style={{ position: "relative", top: "-1px" }}>
            <XIcon verticalAlign="middle" />
          </span>
        </Button>
      </div>
    </div>
  );
}
