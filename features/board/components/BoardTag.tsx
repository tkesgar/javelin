import * as React from "react";
import style from "./BoardTag.module.scss";
import { colorYIQ } from "@/utils/color";
import classnames from "classnames";

const NO_COLOR_BORDER = "#00000040";

type BoardTagProps = React.ComponentPropsWithRef<"span"> & {
  color?: string;
  hash?: boolean;
};

export function BoardTag({
  color,
  hash = false,
  children,
  className,
  ...restProps
}: BoardTagProps): JSX.Element {
  return (
    <span
      className={classnames(
        style.BoardTag,
        hash && style.PrependHash,
        className
      )}
      style={
        color
          ? {
              backgroundColor: color,
              color: colorYIQ(color),
            }
          : { border: `1px solid ${NO_COLOR_BORDER}` }
      }
      {...restProps}
    >
      {children}
    </span>
  );
}

export function colorizeLabels(
  text: string,
  labelColors: Record<string, string>
): string {
  return text.replace(/#(\w+)/g, (match, p1) => {
    const color = labelColors[p1];
    return `<span class="${classnames(style.BoardTag)}" ${
      color
        ? `style="background-color: ${color}; color: ${colorYIQ(color)}"`
        : `style="border: 1px solid ${NO_COLOR_BORDER}"`
    }>#${p1}</span>`;
  });
}
