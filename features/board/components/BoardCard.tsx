import { Card, User } from "@/services/firebase/board";
import * as React from "react";
import { Button } from "react-bootstrap";
import { AlertCircle, ChevronLeft, ChevronRight, Trash2 } from "react-feather";
import style from "./BoardCard.module.scss";
import classnames from "classnames";
import day from "dayjs";

type BoardCardProps = React.ComponentPropsWithRef<"div"> & {
  card: Card;
  user?: User;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onMove?: (direction: "left" | "right") => void;
  onTextUpdate?: (text: string) => void;
  onRemove?: () => void;
};

export default function BoardCard({
  card,
  user,
  canMoveLeft = false,
  canMoveRight = false,
  onMove,
  onTextUpdate,
  onRemove,
  ...restProps
}: BoardCardProps): JSX.Element {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [cardTime, setCardTime] = React.useState<string>(
    `${day().diff(card.timeUpdated, "m")}m ago`
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

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setCardTime(`${day().diff(card.timeUpdated, "m")}m ago`);
    }, 60 * 1000);

    return () => clearTimeout(timeout);
  }, [card]);

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
          <EditableContent
            className={classnames(style.CardContent, "mb-2")}
            initialText={card.content}
            onChange={(text) => {
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
          {user ? (
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
          <small className="text-muted">{cardTime}</small>
        </div>
        <Button
          type="button"
          size="sm"
          variant={confirmDelete ? "danger" : "warning"}
          className={classnames(style.CardDelete, "rounded-circle px-0")}
          style={{ width: "28px" }}
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              return;
            }

            if (onRemove) {
              onRemove();
            }
          }}
          onContextMenu={(evt) => {
            evt.preventDefault();
            setConfirmDelete(false);
          }}
        >
          {confirmDelete ? (
            <>
              <AlertCircle size="16" style={{ verticalAlign: "text-top" }} />
              <span className="sr-only">Are you sure?</span>
            </>
          ) : (
            <>
              <Trash2 size="16" style={{ verticalAlign: "text-top" }} />
              <span className="sr-only">Remove</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

type EditableContentProps = React.ComponentPropsWithoutRef<"div"> & {
  initialText?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  onTags?: (tags: string[]) => void;
};

function EditableContent({
  initialText = "",
  placeholder = null,
  onChange,
  onTags,
  className,
  ...restProps
}: EditableContentProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>();
  const [text, setText] = React.useState(initialText);
  const [lastChangeText, setLastChangeText] = React.useState(initialText);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const { tags, html } = processText(initialText);

    if (onTags) {
      onTags(tags);
    }

    divRef.current.innerHTML = html;
  }, [onTags, initialText]);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const { tags, html } = processText(lastChangeText);

    if (onTags) {
      onTags(tags);
    }

    divRef.current.innerHTML = html;
  }, [onTags, lastChangeText]);

  return (
    <div
      className={classnames(style.EditableContentContainer, className)}
      {...restProps}
    >
      {placeholder && text.length === 0 ? (
        <div
          className={classnames(style.EditableContentPlaceholder, "text-muted")}
        >
          {placeholder}
        </div>
      ) : null}
      <div
        ref={divRef}
        contentEditable
        onInput={() => setText(divRef.current.innerText)}
        onBlur={() => {
          if (onChange) {
            const currentText = divRef.current.innerText;
            if (currentText !== lastChangeText) {
              setLastChangeText(currentText);
              onChange(currentText);
            }
          }
        }}
      />
    </div>
  );
}

function processText(
  text: string
): {
  tags: string[];
  html: string;
} {
  return {
    tags: [...(text.match(/#\w+/g) || [])],
    html: text.replace(/#(\w+)/g, '<span class="Label Label-$1">#$1</span>'),
  };
}
