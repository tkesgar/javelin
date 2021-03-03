import {
  Card,
  createCard,
  removeCard,
  updateBoardUserFromAuth,
  updateCard,
  updateCardSection,
  useBoard,
  useBoardCards,
  useBoardSections,
  useBoardUsers,
  User,
} from "@/services/firebase/board";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import {
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
  const users = useBoardUsers(router.query.boardId as string);

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
                  <Link href={`/${router.query.boardId}/settings`} passHref>
                    <Button variant="secondary">
                      <Settings size="16" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </Link>
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
                                users.find((user) => user.id === card.userId) ||
                                null
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
  );
}

type EditableContentProps = React.ComponentPropsWithoutRef<"div"> & {
  initialText?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
};

function EditableContent({
  initialText = "",
  placeholder = null,
  onChange,
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

    divRef.current.textContent = initialText;
  }, [initialText]);

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
          <small className="text-muted">
            {day().diff(card.timeUpdated, "m")}m ago
            {user ? (
              <>
                {" "}
                by{" "}
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  title={user.displayName}
                  className={classnames(
                    style.CardUserAvatar,
                    "d-inline-block rounded-circle"
                  )}
                />
              </>
            ) : null}
          </small>
        </div>
        <div>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => {
              removeCard(boardId, sectionId, card.id).catch((error) =>
                alert(error.message)
              );
            }}
          >
            <Trash2 size="16" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
