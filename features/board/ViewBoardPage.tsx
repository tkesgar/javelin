import {
  Board,
  Card,
  createCard,
  removeCard,
  updateBoard,
  updateBoardUserFromAuth,
  updateCard,
  updateCardSection,
  useBoard,
  useBoardCards,
  useBoardSections,
  useBoardUsers,
  User,
} from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Trash2,
} from "react-feather";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import MainNavbar from "@/components/MainNavbar";
import day from "dayjs";
import { Auth, useAuth } from "@/services/firebase/auth";

export default function ViewBoardPage(): JSX.Element {
  const auth = useAuth() as Auth;
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);
  const sections = useBoardSections(router.query.boardId as string);
  const sectionCards = useBoardCards(router.query.boardId as string);
  const users = useBoardUsers(auth && (router.query.boardId as string));
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    const boardId = router.query.boardId as string;
    if (!boardId || !users || !auth) {
      return;
    }

    const currentUser = users.find((user) => user.id === auth.uid);
    if (!currentUser) {
      updateBoardUserFromAuth(boardId, auth).catch((error) =>
        console.error(error)
      );
    }
  }, [router, auth, users]);

  function getSectionIndex(sectionId: string): number {
    return sections.findIndex((section) => section.id === sectionId);
  }

  return (
    <>
      <div className="min-vh-100 d-flex flex-column">
        <MainNavbar />
        {board && sections ? (
          <>
            <div>
              <Container fluid className="my-3">
                <div className="border-bottom border-light pb-3 d-flex">
                  <div className="flex-fill">
                    <h1>{board.title}</h1>
                    <div className="text-muted mb-3">{board.description}</div>
                  </div>
                  <div className="ml-3">
                    {auth ? (
                      <Button
                        variant="secondary"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings size="16" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Container>
            </div>
            <div className={classnames(style.Viewport, "border-top flex-fill")}>
              <div
                className={classnames(
                  style.Container,
                  style[`SectionCount${board.sectionCount}`],
                  "mx-auto my-3"
                )}
              >
                <Container fluid>
                  <Row>
                    {sections.map((section) => (
                      <Col key={section.id}>
                        <h2
                          className={classnames(
                            style.SectionTitle,
                            "h5 text-center mb-3"
                          )}
                        >
                          {section.title}
                        </h2>
                        <Button
                          type="button"
                          size="sm"
                          block
                          className="mb-3"
                          onClick={() => {
                            createCard({
                              boardId: board.id,
                              sectionId: section.id,
                              userId: auth.uid,
                            }).catch((error) => alert(error.message));
                          }}
                        >
                          <Plus size="16" />
                        </Button>
                        {(sectionCards?.[section.id] || [])
                          .sort(
                            (cardA, cardB) =>
                              cardB.timeCreated - cardA.timeCreated
                          )
                          .map((card) => {
                            const sectionIndex = getSectionIndex(section.id);
                            const sectionPosition = (() => {
                              if (sectionIndex === 0) {
                                return "leftmost";
                              }
                              if (sectionIndex === sections.length - 1) {
                                return "rightmost";
                              }
                              return null;
                            })();

                            return (
                              <BoardCard
                                key={card.id}
                                className={classnames(style.Card, "mb-3 py-2")}
                                card={card}
                                boardId={board.id}
                                sectionId={section.id}
                                user={
                                  users?.find(
                                    (user) => user.id === card.userId
                                  ) || null
                                }
                                sectionPosition={sectionPosition}
                                onMoveSection={(direction) => {
                                  const newSectionId =
                                    sections[
                                      sectionIndex +
                                        (direction === "left" ? -1 : 1)
                                    ].id;

                                  updateCardSection({
                                    boardId: board.id,
                                    sectionId: section.id,
                                    cardId: card.id,
                                    newSectionId,
                                  }).catch((error) => alert(error.message));
                                }}
                              />
                            );
                          })}
                      </Col>
                    ))}
                  </Row>
                </Container>
              </div>
            </div>
          </>
        ) : (
          <Spinner
            animation="border"
            className="d-block text-center mx-auto my-5"
          />
        )}
      </div>

      <Modal
        size="lg"
        show={showSettings}
        onHide={() => setShowSettings(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h1" className="h4">
            Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BoardSettings board={board} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

interface BoardSettingsProps {
  board: Board;
}

function BoardSettings({ board }: BoardSettingsProps): JSX.Element {
  const [inputTitle, setInputTitle] = React.useState(board.title);
  const [inputDescription, setInputDescription] = React.useState(
    board.description || ""
  );

  React.useEffect(() => {
    setInputTitle(board.title);
    setInputDescription(board.description || "");
  }, [board]);

  return (
    <>
      <h2 className="h5">Board information</h2>
      <Form
        onSubmit={(evt) => {
          evt.preventDefault();

          updateBoard(board.id, {
            title: inputTitle.trim(),
            description: inputDescription.trim() || null,
          }).catch((error) => alert(error.message));
        }}
      >
        <Form.Group controlId="createBoard_title" className="my-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            maxLength={60}
            placeholder={board.title}
            required
            value={inputTitle}
            onChange={(evt) => setInputTitle(evt.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="createBoard_description" className="my-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={160}
            placeholder={board.description}
            value={inputDescription}
            onChange={(evt) => setInputDescription(evt.target.value || "")}
          />
        </Form.Group>
        <Button type="submit" variant="primary">
          Update
        </Button>
      </Form>
    </>
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

type BoardCardProps = React.ComponentPropsWithRef<"div"> & {
  card: Card;
  boardId: string;
  sectionId: string;
  sectionPosition?: "leftmost" | "rightmost";
  onMoveSection?: (direction: "left" | "right") => void;
  user?: User;
};

function BoardCard({
  card,
  boardId,
  sectionId,
  sectionPosition,
  onMoveSection,
  user,
  ...restProps
}: BoardCardProps): JSX.Element {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [cardTime, setCardTime] = React.useState<string>(
    `${day().diff(card.timeUpdated, "m")}m ago`
  );
  const onTagsCallback = React.useCallback((tags) => setTags(tags), []);

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
            sectionPosition === "leftmost" && "invisible"
          )}
          onClick={() => onMoveSection("left")}
        >
          <ChevronLeft size="16" />
        </Button>
        <div className="flex-fill">
          <EditableContent
            className={classnames(style.CardContent, "mb-2")}
            initialText={card.content}
            onChange={(text) => {
              updateCard({
                boardId,
                sectionId,
                cardId: card.id,
                content: text,
              }).catch((error) => alert(error.message));
            }}
            onTags={onTagsCallback}
          />
        </div>
        <Button
          type="button"
          variant="light"
          size="sm"
          className={classnames(
            "bg-transparent border-0 p-0 ml-2 mr-1",
            sectionPosition === "rightmost" && "invisible"
          )}
          onClick={() => onMoveSection("right")}
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
        <div>
          <Button
            type="button"
            size="sm"
            variant={confirmDelete ? "danger" : "warning"}
            className="rounded-circle px-0"
            style={{ width: "28px" }}
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }

              removeCard(boardId, sectionId, card.id).catch((error) =>
                alert(error.message)
              );
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
    </div>
  );
}
