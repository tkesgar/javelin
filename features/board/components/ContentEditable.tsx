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

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = transformHTML
      ? transformHTML(initialText)
      : initialText;
  }, [initialText, transformHTML]);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = transformHTML ? transformHTML(text) : text;
  }, [text, transformHTML]);

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
