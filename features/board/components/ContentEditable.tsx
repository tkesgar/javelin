import * as React from "react";

type ContentEditableProps = React.ComponentPropsWithoutRef<"div"> & {
  initialText?: string;
  placeholder?: string;
  onContentChange?: (text: string) => void;
  transformHTML?: (text: string) => string;
};

export default function ContentEditable({
  initialText = "",
  onContentChange,
  transformHTML,
  ...restProps
}: ContentEditableProps): JSX.Element {
  const [text, setText] = React.useState(initialText);
  const divRef = React.useRef<HTMLDivElement>();

  const processHTML = React.useCallback(
    (text: string) => {
      let result = text;

      if (transformHTML) {
        result = transformHTML(text);
      }

      return result;
    },
    [transformHTML]
  );

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = processHTML(initialText);
  }, [initialText, processHTML]);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = processHTML(text);
  }, [text, processHTML]);

  return (
    <div
      {...restProps}
      ref={divRef}
      contentEditable
      onBlur={() => {
        if (onContentChange) {
          const currentText = divRef.current.innerText;
          if (currentText !== text) {
            setText(currentText);
            onContentChange(currentText);
          }
        }
      }}
    />
  );
}
