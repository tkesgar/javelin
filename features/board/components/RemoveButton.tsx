import * as React from "react";
import { Button } from "react-bootstrap";
import { AlertCircle, Trash2 } from "react-feather";
import style from "./RemoveButton.module.scss";
import classnames from "classnames";

type RemoveButtonProps = React.ComponentPropsWithRef<Button> & {
  timeout?: number;
  confirmChildren?: React.ReactNode;
  onRemove?: () => void;
};

export default function RemoveButton({
  onRemove,
  timeout = 2000,
  children = (
    <>
      <Trash2 size="16" style={{ verticalAlign: "text-top" }} />
      <span className="sr-only">Remove</span>
    </>
  ),
  confirmChildren = (
    <>
      <AlertCircle size="16" style={{ verticalAlign: "text-top" }} />
      <span className="sr-only">Are you sure?</span>
    </>
  ),
  ...restProps
}: RemoveButtonProps): JSX.Element {
  const [confirm, setConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!confirm) {
      return;
    }

    const t = setTimeout(() => {
      setConfirm(false);
    }, timeout);

    return () => clearTimeout(t);
  }, [confirm, timeout]);

  return (
    <Button
      type="button"
      size="sm"
      variant={confirm ? "danger" : "warning"}
      className={classnames(style.RemoveButton, "rounded-circle px-0")}
      onClick={() => {
        if (!confirm) {
          setConfirm(true);
          return;
        }

        if (onRemove) {
          onRemove();
        }
      }}
      onContextMenu={(evt) => {
        if (!confirm) {
          return;
        }

        evt.preventDefault();
        setConfirm(false);
      }}
      {...restProps}
    >
      {confirm ? confirmChildren : children}
    </Button>
  );
}
