import { Card, User } from "@/services/firebase/board";
import * as React from "react";
import { Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-feather";
import style from "./BoardCard.module.scss";
import classnames from "classnames";
import day from "dayjs";
import { colorYIQ } from "@/utils/color";
import ContentEditable from "./ContentEditable";
import RemoveButton from "./RemoveButton";

type BoardCardProps = React.ComponentPropsWithRef<"div"> & {
  card: Card;
  user?: User;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  showCreator?: boolean;
  showTimestamp?: boolean;
  showRemove?: boolean;
  labelColors?: Record<string, string>;
  onMove?: (direction: "left" | "right") => void;
  onTextUpdate?: (text: string) => void;
  onRemove?: () => void;
};

export default function BoardCard({
  card,
  user,
  canMoveLeft = false,
  canMoveRight = false,
  showCreator = false,
  showTimestamp = false,
  showRemove = false,
  labelColors = {},
  onMove,
  onTextUpdate,
  onRemove,
  ...restProps
}: BoardCardProps): JSX.Element {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const transformHTMLCallback = React.useCallback(
    (text: string) => {
      return colorizeLabels(text, labelColors);
    },
    [labelColors]
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
    <div {...restProps}>
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
          {showTimestamp ? (
            <small className="text-muted">{cardTime}</small>
          ) : null}
        </div>
        {showRemove ? <RemoveButton onRemove={onRemove} /> : null}
      </div>
    </div>
  );
}

function colorizeLabels(
  text: string,
  labelColors: Record<string, string>
): string {
  return text.replace(/#(\w+)/g, (match, p1) => {
    const color = labelColors[p1];
    return `<span class="Label" ${
      color
        ? `style="background-color: ${color}; color: ${colorYIQ(color)}"`
        : ""
    }>#${p1}</span>`;
  });
}

function formatTimestamp(ts: number): string {
  const minutes = day().diff(ts, "m");
  if (minutes < 24 * 60) {
    return `${minutes}m ago`;
  }

  const days = day().diff(ts, "d");
  return `${days}d ago`;
}
