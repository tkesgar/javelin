import {
  Board,
  createCard,
  removeCard,
  updateBoard,
  updateCard,
  moveCard,
  useBoard,
  useBoardCards,
  useBoardSections,
  useBoardUsers,
} from "@/services/firebase/board";
import { useRouter } from "next/router";
import * as React from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { Plus, Settings, Trash2 } from "react-feather";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/services/firebase/auth";
import BoardCard from "./components/BoardCard";
import debounce from "lodash/debounce";
import ContentEditable from "./components/ContentEditable";
import { colorYIQ } from "@/utils/color";

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
      map[label.key] = label.color;
    }

    return map;
  }, [board]);

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
                            return (
                              <BoardCard
                                key={card.id}
                                className={classnames(style.Card, "mb-3 py-2")}
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
  const auth = useAuth();
  const [inputTitle, setInputTitle] = React.useState(board.title);
  const [inputDescription, setInputDescription] = React.useState(
    board.description || ""
  );
  const [config, setConfig] = React.useState<Board["config"]>({
    ...board.config,
  });
  const [labels, setLabels] = React.useState<Board["labels"]>([
    ...board.labels,
  ]);

  React.useEffect(() => {
    setInputTitle(board.title);
    setInputDescription(board.description || "");
    setConfig({ ...board.config });
    setLabels([...board.labels]);
  }, [board]);

  const isBoardOwner = board.ownerId === (auth && auth.uid);

  function updateConfig(name: keyof Board["config"], value: unknown): void {
    setConfig((currentConfig) => ({
      ...currentConfig,
      [name]: value,
    }));
    updateBoard({
      id: board.id,
      config: {
        ...board.config,
        [name]: value,
      },
    }).catch((error) => alert(error.message));
  }

  function updateLabels(
    updateFn: (currentLabels: Board["labels"]) => Board["labels"]
  ): void {
    setLabels(updateFn);
    updateBoard({
      id: board.id,
      labels: updateFn(board.labels),
    }).catch((error) => alert(error.message));
  }

  const updateLabelColor = debounce((key: string, color: string) => {
    updateLabels((currentLabels) =>
      currentLabels.map((label) =>
        label.key === key ? { ...label, color } : label
      )
    );
  }, 500);

  return (
    <>
      {!isBoardOwner ? (
        <Alert variant="warning">
          Only board information can modify these settings.
        </Alert>
      ) : null}

      <h2 className="h5 mb-3">Board information</h2>
      <Form
        onSubmit={(evt) => {
          evt.preventDefault();

          updateBoard({
            id: board.id,
            title: inputTitle.trim(),
            description: inputDescription.trim() || null,
          }).catch((error) => alert(error.message));
        }}
        className="mb-4"
      >
        <Form.Group controlId="boardSettings_title" className="my-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            maxLength={60}
            placeholder={board.title}
            disabled={!isBoardOwner}
            required
            value={inputTitle}
            onChange={(evt) => setInputTitle(evt.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="boardSettings_description" className="my-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={160}
            placeholder={board.description}
            disabled={!isBoardOwner}
            value={inputDescription}
            onChange={(evt) => setInputDescription(evt.target.value || "")}
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={!isBoardOwner}>
          Update
        </Button>
      </Form>

      <h2 className="h5 mb-3">Board features</h2>
      <div className="mb-4">
        <Form.Group>
          <Form.Check
            type="switch"
            id="boardSettings_showCreator"
            label="Show card creator"
            checked={config.showCardCreator}
            onChange={(evt) => {
              const value = evt.target.checked;
              updateConfig("showCardCreator", value);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="switch"
            id="boardSettings_showUpdatedTimestamp"
            label="Show card last updated timestamp"
            checked={config.showTimestamp}
            onChange={(evt) => {
              const value = evt.target.checked;
              updateConfig("showTimestamp", value);
            }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="switch"
            id="boardSettings_hideRemoveCardButton"
            label="Only show remove card button to board owner"
            checked={config.removeCardOnlyOwner}
            onChange={(evt) => {
              const value = evt.target.checked;
              updateConfig("removeCardOnlyOwner", value);
            }}
          />
        </Form.Group>
      </div>

      <h2 className="h5 mb-3">Labels</h2>
      <div className="mb-4">
        <div className="mb-3">
          {labels.length === 0 ? (
            <div className="text-muted">
              This board currently has no labels.
            </div>
          ) : (
            <ul>
              {labels.map((label) => (
                <li key={label.key}>
                  <span
                    className={style.Label}
                    style={{
                      backgroundColor: label.color,
                      color: colorYIQ(label.color),
                    }}
                  >
                    #
                    <ContentEditable
                      className="d-inline-block"
                      initialText={label.key}
                      onContentChange={(text) => {
                        updateLabels((currentLabels) =>
                          currentLabels.map((l) =>
                            l.key === label.key
                              ? { key: text, color: l.color }
                              : l
                          )
                        );
                      }}
                    />
                  </span>
                  <input
                    type="color"
                    className={classnames(style.LabelColorInput, "ml-1")}
                    value={label.color}
                    onChange={(evt) => {
                      const color = evt.target.value;
                      updateLabelColor(label.key, color);
                    }}
                  />
                  {/* Use double click button like in card */}
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      updateLabels((currentLabels) =>
                        currentLabels.filter((l) => l.key !== label.key)
                      );
                    }}
                  >
                    <Trash2 size="16" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            let newLabel = `label_${labels.length + 1}`;
            if (labels.find((label) => label.key === newLabel)) {
              newLabel = newLabel + "_2";
            }

            updateLabels((currentLabels) => [
              ...currentLabels,
              {
                key: newLabel,
                color: "#888888",
              },
            ]);
          }}
          disabled={labels.length >= 10}
        >
          {labels.length < 10
            ? "Add new label"
            : "Maximum number of labels has been reached"}
        </Button>
      </div>
    </>
  );
}
