import { Board, updateBoard } from "@/services/firebase/board";
import * as React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import style from "./BoardSettingsModal.module.scss";
import classnames from "classnames";
import debounce from "lodash/debounce";
import ContentEditable from "./components/ContentEditable";
import RemoveButton from "./components/RemoveButton";
import BoardTag from "./components/BoardTag";

const DEFAULT_MARK_STALE_MINUTES = 24 * 60;

type BoardSettingsProps = React.ComponentPropsWithRef<Modal> & {
  board: Board;
};

export default function BoardSettingsModal({
  board,
  onHide,
  ...restProps
}: BoardSettingsProps): JSX.Element {
  return (
    <Modal onHide={onHide} {...restProps}>
      <Modal.Header closeButton>
        <Modal.Title as="h1" className="h4">
          Settings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2 className="h5 mb-3">Board information</h2>
        <BoardInfoForm board={board} />

        <h2 className="h5 mb-3">Board configuration</h2>
        <div className="mb-4">
          <BoardConfig board={board} />
        </div>

        <h2 className="h5 mb-3">Label colors</h2>
        <div className="mb-4">
          <BoardLabels board={board} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function BoardInfoForm({ board }: { board: Board }): JSX.Element {
  const [inputTitle, setInputTitle] = React.useState(board.title);
  const [inputDescription, setInputDescription] = React.useState(
    board.description || ""
  );

  React.useEffect(() => {
    setInputTitle(board.title);
    setInputDescription(board.description || "");
  }, [board]);

  return (
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
          value={inputDescription}
          onChange={(evt) => setInputDescription(evt.target.value || "")}
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        Update
      </Button>
    </Form>
  );
}

function BoardConfig({ board }: { board: Board }): JSX.Element {
  const [config, setConfig] = React.useState<Board["config"]>({
    ...board.config,
  });

  React.useEffect(() => {
    setConfig({ ...board.config });
  }, [board]);

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

  return (
    <>
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
      <Form.Group>
        <Form.Check
          type="switch"
          id="boardSettings_enableMarkStale"
          className="mb-2"
          label={
            <>
              Mark old cards with <BoardTag hash>stale</BoardTag> tag
            </>
          }
          checked={config.markStaleMinutes > 0}
          onChange={(evt) => {
            const checked = evt.target.checked;
            updateConfig(
              "markStaleMinutes",
              checked ? DEFAULT_MARK_STALE_MINUTES : 0
            );
          }}
        />
        {config.markStaleMinutes > 0 ? (
          <div className="d-flex align-items-center pl-4">
            <Form.Label
              htmlFor="boardSettings_markStaleMinutes"
              className="mb-0 mr-2"
            >
              Stale cards age:
            </Form.Label>
            <Form.Control
              type="number"
              id="boardSettings_markStaleMinutes"
              min={1}
              style={{ maxWidth: "10rem" }}
              defaultValue={config.markStaleMinutes}
              onBlur={(evt) => {
                const valueStr = evt.target.value;

                const value = parseInt(valueStr, 10);
                if (!value || value <= 0) {
                  return;
                }

                updateConfig("markStaleMinutes", value);
              }}
            />
          </div>
        ) : null}
      </Form.Group>
    </>
  );
}

function BoardLabels({ board }: { board: Board }): JSX.Element {
  const [labels, setLabels] = React.useState<Board["labels"]>([
    ...board.labels,
  ]);

  React.useEffect(() => {
    setLabels([...board.labels]);
  }, [board]);

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
    <>
      <div className="mb-3">
        {labels.length === 0 ? (
          <div className="text-muted">This board currently has no labels.</div>
        ) : (
          <ul className="list-unstyled pl-4">
            {labels.map((label, index) => (
              <li key={`${label.key}-${index}`}>
                <div className="d-flex align-items-center mb-2">
                  <div className="mr-1">
                    <BoardTag hash color={label.color}>
                      <ContentEditable
                        className="d-inline-block"
                        initialText={label.key}
                        onContentChange={(inputText) => {
                          const text = inputText.replace(/[^\w]/g, "_");
                          updateLabels((currentLabels) =>
                            currentLabels.map((l, i) =>
                              i === index ? { key: text, color: l.color } : l
                            )
                          );
                        }}
                      />
                    </BoardTag>
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
                  {(() => {
                    let message: string = null;

                    if (
                      labels.findIndex((l) => l.key === label.key) !== index
                    ) {
                      message = "Duplicate labels will be ignored";
                    }

                    if (message) {
                      return message ? (
                        <span className="text-muted d-inline-block ml-2">
                          {message}
                        </span>
                      ) : null;
                    }
                  })()}
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
    </>
  );
}
