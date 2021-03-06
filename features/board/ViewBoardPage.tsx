import {
  createCard,
  removeCard,
  updateCard,
  moveCard,
  useBoard,
  useBoardCards,
  useBoardSections,
  useBoardUsers,
  DEFAULT_TAG_COLOR,
} from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Plus, Settings } from "react-feather";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/services/firebase/auth";
import BoardCard from "./components/BoardCard";
import BoardSettingsModal from "./BoardSettingsModal";
import dayjs from "dayjs";

export default function ViewBoardPage(): JSX.Element {
  const auth = useAuth();
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);
  const sections = useBoardSections(router.query.boardId as string);
  const sectionCards = useBoardCards(router.query.boardId as string);
  const users = useBoardUsers(router.query.boardId as string);
  const [showSettings, setShowSettings] = React.useState(false);

  const labelColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};

    for (const label of board?.labels || []) {
      if (map[label.key]) {
        continue;
      }

      map[label.key] = label.color;
    }

    if (!map["stale"]) {
      map["stale"] = DEFAULT_TAG_COLOR;
    }

    return map;
  }, [board]);

  function getSectionIndex(sectionId: string): number {
    return sections.findIndex((section) => section.id === sectionId);
  }

  const isBoardOwner = board && auth && board.ownerId === auth.uid;

  return (
    <>
      <div className="min-vh-100 d-flex flex-column">
        <MainNavbar />
        {board && sections ? (
          <>
            <div>
              <Container fluid className="my-3">
                <div className="d-flex">
                  <div className="flex-fill">
                    <h1>{board.title}</h1>
                    <div className="text-muted mb-3">{board.description}</div>
                  </div>
                  <div className="ml-3">
                    {isBoardOwner ? (
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
                            if (!auth) {
                              throw new Error(`User is not authenticated`);
                            }

                            createCard({
                              auth,
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
                            const tags = [
                              ...new Set(
                                [
                                  ...(card.content.match(/#\w+/g) || [])
                                    .map((str) => str.slice(1))
                                    .filter((str) =>
                                      board.labels.find(
                                        (label) => label.key === str
                                      )
                                    ),
                                  board.config.markStaleMinutes &&
                                    dayjs().diff(card.timeCreated, "m") >=
                                      board.config.markStaleMinutes &&
                                    "stale",
                                ].filter((v) => v)
                              ),
                            ].sort();

                            return (
                              <BoardCard
                                key={card.id}
                                className="mb-3"
                                card={card}
                                user={
                                  users?.find(
                                    (user) => user.id === card.userId
                                  ) || null
                                }
                                canMoveLeft={sectionIndex > 0}
                                canMoveRight={
                                  sectionIndex < sections.length - 1
                                }
                                showCreator={board.config.showCardCreator}
                                showTimestamp={board.config.showTimestamp}
                                showRemove={
                                  board.config.removeCardOnlyOwner
                                    ? board.ownerId === (auth && auth.uid)
                                    : true
                                }
                                labelColors={labelColorMap}
                                tags={tags}
                                onMove={(direction) => {
                                  const newSectionId =
                                    sections[
                                      sectionIndex +
                                        (direction === "left" ? -1 : 1)
                                    ].id;

                                  moveCard({
                                    boardId: board.id,
                                    sectionIdFrom: section.id,
                                    cardId: card.id,
                                    sectionIdTo: newSectionId,
                                  }).catch((error) => alert(error.message));
                                }}
                                onTextUpdate={(text) => {
                                  updateCard({
                                    boardId: board.id,
                                    sectionId: section.id,
                                    cardId: card.id,
                                    content: text,
                                  }).catch((error) => alert(error.message));
                                }}
                                onRemove={() => {
                                  removeCard({
                                    boardId: board.id,
                                    sectionId: section.id,
                                    cardId: card.id,
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

      <BoardSettingsModal
        board={board}
        size="lg"
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />
    </>
  );
}
