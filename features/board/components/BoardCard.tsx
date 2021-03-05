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
  showCreator?: boolean;
  showTimestamp?: boolean;
  showRemove?: boolean;
  labels: { key: string; color: string }[];
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
  labels = [],
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
            labels={labels}
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
        {showRemove ? (
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
        ) : null}
      </div>
    </div>
  );
}

type EditableContentProps = React.ComponentPropsWithoutRef<"div"> & {
  initialText?: string;
  placeholder?: string;
  labels?: BoardCardProps["labels"];
  onChange?: (text: string) => void;
  onTags?: (tags: string[]) => void;
};

// TODO Replace with ContentEditable
function EditableContent({
  initialText = "",
  placeholder = null,
  labels = [],
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

    const { tags, html } = processText(initialText, labels);

    if (onTags) {
      onTags(tags);
    }

    divRef.current.innerHTML = html;
  }, [onTags, initialText, labels]);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const { tags, html } = processText(lastChangeText, labels);

    if (onTags) {
      onTags(tags);
    }

    divRef.current.innerHTML = html;
  }, [onTags, lastChangeText, labels]);

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
  text: string,
  labels: BoardCardProps["labels"]
): {
  tags: string[];
  html: string;
} {
  return {
    tags: [...(text.match(/#\w+/g) || [])],
    html: text.replace(/#(\w+)/g, (match, p1) => {
      const color = labels.find((label) => label.key === p1)?.color;
      return `<span class="Label" ${
        color
          ? `style="background-color: ${color}; color: ${colorYIQ(color)}"`
          : ""
      }>#${p1}</span>`;
    }),
  };
}

const YIQ_TEXT_DARK = "#212529";
const YIQ_TEXT_LIGHT = "#ffffff";
const YIQ_CONTRASTED_THRESHOLD = 150;

function colorYIQ(color, dark = YIQ_TEXT_DARK, light = YIQ_TEXT_LIGHT) {
  const [r, g, b] = color
    .slice(1)
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= YIQ_CONTRASTED_THRESHOLD ? dark : light;
}
