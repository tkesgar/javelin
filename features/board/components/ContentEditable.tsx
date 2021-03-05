import * as React from "react";

type ContentEditableProps = React.ComponentPropsWithoutRef<"div"> & {
  initialText?: string;
  placeholder?: string;
  onContentChange?: (text: string) => void;
  transformText?: (text: string) => string;
};

export default function ContentEditable({
  initialText = "",
  placeholder = null,
  onContentChange,
  transformText,
  ...restProps
}: ContentEditableProps): JSX.Element {
  const [text, setText] = React.useState(initialText);
  const [lastChangeText, setLastChangeText] = React.useState(initialText);
  const divRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = transformText
      ? transformText(initialText)
      : initialText;
  }, [initialText, transformText]);

  React.useEffect(() => {
    if (!divRef.current) {
      return;
    }

    divRef.current.innerHTML = transformText
      ? transformText(lastChangeText)
      : lastChangeText;
  }, [lastChangeText, transformText]);

  return (
    <div {...restProps}>
      {placeholder && text.length === 0 ? (
        <div className="text-muted">{placeholder}</div>
      ) : null}
      <div
        ref={divRef}
        contentEditable
        onInput={() => setText(divRef.current.innerText)}
        onBlur={() => {
          if (onContentChange) {
            const currentText = divRef.current.innerText;
            if (currentText !== lastChangeText) {
              setLastChangeText(currentText);
              onContentChange(currentText);
            }
          }
        }}
      />
    </div>
  );
}
