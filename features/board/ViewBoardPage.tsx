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
  Board,
  Card,
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
import BoardTag from "./components/BoardTag";

const FILTER_STORAGE_KEY = (boardId: string) => `javelin:filter:${boardId}`;

export default function ViewBoardPage(): JSX.Element {
  const auth = useAuth();
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);
  const [showSettings, setShowSettings] = React.useState(false);
  const [labelFilter, setLabelFilter] = React.useState<Record<string, boolean>>(
    {}
  );

  const boardLabels = React.useMemo<Board["labels"]>(() => {
    if (!board) {
      return null;
    }

    return [
      ...board.labels,
      ...(board.config.markStaleMinutes > 0 &&
      !board.labels.find((label) => label.key === "stale")
        ? [{ key: "stale", color: DEFAULT_TAG_COLOR }]
        : []),
    ].sort();
  }, [board]);

  React.useEffect(() => {
    if (!board) {
      return;
    }

    setLabelFilter((currentLabelFilter) => {
      const newLabelFilter: Record<string, boolean> = {};
      const savedLabelFilter: Record<string, boolean> = loadFromLocalStorage(
        FILTER_STORAGE_KEY(board.id),
        {}
      );

      for (const label of boardLabels) {
        newLabelFilter[label.key] =
          currentLabelFilter[label.key] ?? savedLabelFilter[label.key] ?? true;
      }

      return newLabelFilter;
    });
  }, [board, boardLabels]);

  const isBoardOwner = board && auth && board.ownerId === auth.uid;

  return (
    <>
      <div className="min-vh-100 d-flex flex-column">
        <MainNavbar />
        {board ? (
          <>
            <Container
              fluid
              className={classnames(
                style.BoardHeader,
                "d-flex py-3 bg-white border-bottom"
              )}
            >
              <div className="flex-fill">
                <div className="mb-3">
                  <h1 className="h4">{board.title}</h1>
                  <div className="text-muted">{board.description}</div>
                </div>
                <div>
                  {boardLabels.map((label) => (
                    /* TODO lighten background color instead of using opacity */
                    <BoardTag
                      key={label.key}
                      hash
                      color={labelFilter[label.key] && label.color}
                      className="mr-1 mb-1"
                      role="button"
                      style={{
                        opacity: labelFilter[label.key] ? "1.0" : "0.8",
                      }}
                      onClick={() => {
                        setLabelFilter((currentLabelFilter) => {
                          const newLabelFilter = {
                            ...currentLabelFilter,
                            [label.key]: !currentLabelFilter[label.key],
                          };

                          saveToLocalStorage(
                            FILTER_STORAGE_KEY(board.id),
                            newLabelFilter
                          );

                          return newLabelFilter;
                        });
                      }}
                    >
                      {label.key}
                    </BoardTag>
                  ))}
                </div>
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
            </Container>
            <div className={classnames(style.Viewport, "flex-fill")}>
              <div
                className={classnames(
                  style.Container,
                  style[`SectionCount${board.sectionCount}`],
                  "mx-auto my-3"
                )}
              >
                <BoardView board={board} labelFilter={labelFilter} />
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

function BoardView({
  board,
  labelFilter,
}: {
  board: Board;
  labelFilter: Record<string, boolean>;
}): JSX.Element {
  const auth = useAuth();
  const sections = useBoardSections(board.id);
  const sectionCards = useBoardCards(board.id);
  const users = useBoardUsers(board.id);

  const labelColorMap = React.useMemo(() => {
    return createLabelColorMap(board.labels);
  }, [board]);

  return (
    <Container fluid>
      {sections ? (
        <Row>
          {sections.map((section, sectionIndex) => (
            <Col key={section.id}>
              <h2
                className={classnames(
                  style.SectionTitle,
                  "h5 text-center mb-3"
                )}
              >
                {section.title}
              </h2>
              {auth ? (
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
              ) : null}

              {(sectionCards?.[section.id] || [])
                .sort((cardA, cardB) => cardB.timeCreated - cardA.timeCreated)
                .map<[Card, string[]]>((card) => [
                  card,
                  unique(
                    [
                      ...(card.content.match(/#\w+/g) || [])
                        .map((str) => str.slice(1))
                        .filter((str) =>
                          board.labels.find((label) => label.key === str)
                        ),
                      board.config.markStaleMinutes &&
                        dayjs().diff(card.timeCreated, "m") >=
                          board.config.markStaleMinutes &&
                        "stale",
                    ].filter((v) => v)
                  ).sort(),
                ])
                .filter(
                  ([, tags]) =>
                    tags.length === 0 || tags.find((tag) => labelFilter[tag])
                )
                .map(([card, tags]) => {
                  return (
                    <BoardCard
                      key={card.id}
                      className="mb-3"
                      card={card}
                      user={
                        users?.find((user) => user.id === card.userId) || null
                      }
                      canMoveLeft={sectionIndex > 0}
                      canMoveRight={sectionIndex < sections.length - 1}
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
                            sectionIndex + (direction === "left" ? -1 : 1)
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
      ) : (
        <Spinner
          animation="border"
          className="d-block text-center mx-auto my-5"
        />
      )}
    </Container>
  );
}

function createLabelColorMap(labels: Board["labels"]) {
  const map: Record<string, string> = {};

  for (const label of labels || []) {
    if (map[label.key]) {
      continue;
    }

    map[label.key] = label.color;
  }

  if (!map["stale"]) {
    map["stale"] = DEFAULT_TAG_COLOR;
  }

  return map;
}

function unique<T = unknown>(array: T[]): T[] {
  return [...new Set(array)];
}

function saveToLocalStorage(key: string, value: unknown): void {
  const json = JSON.stringify(value);
  localStorage.setItem(key, json);
}

function loadFromLocalStorage<T>(key: string, defaultValue = null): T {
  const json = localStorage.getItem(key);
  if (json === null) {
    return defaultValue;
  }

  return JSON.parse(json);
}
