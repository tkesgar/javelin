import {
  Board,
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
import { Plus, Settings } from "react-feather";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import MainNavbar from "@/components/MainNavbar";
import { Auth, useAuth } from "@/services/firebase/auth";
import BoardCard from "./components/BoardCard";

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
                                    ? board.ownerId === auth?.uid
                                    : true
                                }
                                onMove={(direction) => {
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
                                onTextUpdate={(text) => {
                                  updateCard({
                                    boardId: board.id,
                                    sectionId: section.id,
                                    cardId: card.id,
                                    content: text,
                                  }).catch((error) => alert(error.message));
                                }}
                                onRemove={() => {
                                  removeCard(
                                    board.id,
                                    section.id,
                                    card.id
                                  ).catch((error) => alert(error.message));
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
  const auth = useAuth() as Auth;
  const [inputTitle, setInputTitle] = React.useState(board.title);
  const [inputDescription, setInputDescription] = React.useState(
    board.description || ""
  );
  const [config, setConfig] = React.useState<Board["config"]>({
    ...board.config,
  });
  const [labels, setLabels] = React.useState<{ name: string; color: string }[]>(
    []
  );

  const enableLabels = true;

  React.useEffect(() => {
    setInputTitle(board.title);
    setInputDescription(board.description || "");
    setConfig({ ...board.config });
  }, [board]);

  const isBoardOwner = board.ownerId === auth?.uid;

  function updateConfig(name: keyof Board["config"], value: unknown): void {
    setConfig((currentConfig) => ({
      ...currentConfig,
      [name]: value,
    }));
    updateBoard(board.id, {
      config: {
        ...board.config,
        [name]: value,
      },
    }).catch((error) => alert(error.message));
  }

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

          updateBoard(board.id, {
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
        <Form.Group>
          <Form.Check
            type="switch"
            id="boardSettings_enableLabels"
            label="Enable card labels"
          />
        </Form.Group>
        {enableLabels ? (
          <>
            <Button type="button" variant="primary" className="mb-3">
              Add label
            </Button>
            {labels.length === 0 ? (
              <div className="text-muted">
                This board currently has no labels.
              </div>
            ) : (
              <ul>
                {labels.map((label) => (
                  <li key={label.name}></li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
