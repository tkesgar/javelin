import { Board, updateBoard } from "@/services/firebase/board";
import * as React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import { useAuth } from "@/services/firebase/auth";
import debounce from "lodash/debounce";
import ContentEditable from "./components/ContentEditable";
import { colorYIQ } from "@/utils/color";
import RemoveButton from "./components/RemoveButton";

type BoardSettingsProps = React.ComponentPropsWithRef<Modal> & {
  board: Board;
};

export default function BoardSettingsModal({
  board,
  onHide,
  ...restProps
}: BoardSettingsProps): JSX.Element {
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

  const updateLabelColor = debounce((index: number, color: string) => {
    updateLabels((currentLabels) =>
      currentLabels.map((label, i) =>
        i === index ? { ...label, color } : label
      )
    );
  }, 500);

  return (
    <Modal onHide={onHide} {...restProps}>
      <Modal.Header closeButton>
        <Modal.Title as="h1" className="h4">
          Settings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
              <ul className="list-unstyled">
                {labels.map((label, index) => (
                  <li key={`${label.key}-${index}`}>
                    <div className="d-flex align-items-center mb-2">
                      <div className="mr-1">
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
                                currentLabels.map((l, i) =>
                                  i === index
                                    ? { key: text, color: l.color }
                                    : l
                                )
                              );
                            }}
                          />
                        </span>
                      </div>
                      <input
                        type="color"
                        className={classnames(style.LabelColorInput, "mr-1")}
                        value={label.color}
                        onChange={(evt) => {
                          const color = evt.target.value;
                          updateLabelColor(index, color);
                        }}
                      />
                      <RemoveButton
                        onRemove={() => {
                          updateLabels((currentLabels) =>
                            currentLabels.filter((l, i) => i !== index)
                          );
                        }}
                      />
                      {labels.findIndex((l) => l.key === label.key) !==
                      index ? (
                        <span className="text-muted d-inline-block ml-2">
                          Duplicate labels will be ignored
                        </span>
                      ) : null}
                    </div>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
