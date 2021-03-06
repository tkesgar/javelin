import { Card, User } from "@/services/firebase/board";
import * as React from "react";
import { Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-feather";
import style from "./BoardCard.module.scss";
import classnames from "classnames";
import day from "dayjs";
import ContentEditable from "./ContentEditable";
import RemoveButton from "./RemoveButton";
import BoardTag, { colorizeLabels } from "./BoardTag";

type BoardCardProps = React.ComponentPropsWithRef<"div"> & {
  card: Card;
  user?: User;
  processTags?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  showCreator?: boolean;
  showTimestamp?: boolean;
  showRemove?: boolean;
  labelColors?: Record<string, string>;
  tags?: string[];
  onMove?: (direction: "left" | "right") => void;
  onTextUpdate?: (text: string) => void;
  onRemove?: () => void;
};

export default function BoardCard({
  card,
  user,
  processTags = false,
  canMoveLeft = false,
  canMoveRight = false,
  showCreator = false,
  showTimestamp = false,
  showRemove = false,
  labelColors = {},
  tags = [],
  onMove,
  onTextUpdate,
  onRemove,
  className,
  ...restProps
}: BoardCardProps): JSX.Element {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const transformHTMLCallback = React.useCallback(
    (text: string) => {
      if (!processTags) {
        return text;
      }

      return colorizeLabels(text, labelColors);
    },
    [labelColors, processTags]
  );

  React.useEffect(() => {
    if (!confirmDelete) {
      return;
    }

    const timeout = setTimeout(() => {
      setConfirmDelete(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [confirmDelete]);

  const cardTime = formatTimestamp(card.timeCreated);

  return (
    <div className={classnames(style.Card, className, "py-2")} {...restProps}>
      {tags.length > 0 ? (
        <div className={classnames(style.CardHeader, "mx-2 pb-2 mb-2")}>
          {tags.map((tag) => (
            <BoardTag key={tag} hash color={labelColors[tag]} className="mr-1">
              {tag}
            </BoardTag>
          ))}
        </div>
      ) : null}
      <div className="d-flex align-items-center mb-2">
        <Button
          type="button"
          variant="light"
          size="sm"
          className={classnames(
            "bg-transparent border-0 p-0 ml-1 mr-2",
            !canMoveLeft && "invisible"
          )}
          onClick={() => onMove("left")}
        >
          <ChevronLeft size="16" />
        </Button>
        <div className="flex-fill">
          <ContentEditable
            className={classnames(style.CardContent, "mb-2")}
            initialText={card.content}
            transformHTML={transformHTMLCallback}
            onContentChange={(text) => {
              if (onTextUpdate) {
                onTextUpdate(text);
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="light"
          size="sm"
          className={classnames(
            "bg-transparent border-0 p-0 ml-2 mr-1",
            !canMoveRight && "invisible"
          )}
          onClick={() => onMove("right")}
        >
          <ChevronRight size="16" />
        </Button>
      </div>
      <div className="d-flex align-items-end mx-2">
        <div className="flex-fill">
          {user && showCreator ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              title={user.displayName}
              className={classnames(
                style.CardUserAvatar,
                "d-inline-block rounded-circle mr-1"
              )}
            />
          ) : null}
          {showTimestamp ? <small>{cardTime}</small> : null}
        </div>
        {showRemove ? <RemoveButton onRemove={onRemove} /> : null}
      </div>
    </div>
  );
}

function formatTimestamp(ts: number): string {
  const minutes = day().diff(ts, "m");
  if (minutes < 24 * 60) {
    return `${minutes}m ago`;
  }

  const days = day().diff(ts, "d");
  return `${days}d ago`;
}
