type FormElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLFormElement;

export type FormEventHandler<T extends FormElement> = (
  event: React.FormEvent<T>
) => void;

export type MouseEventHandler<T extends HTMLElement = HTMLElement> = (
  event: React.MouseEvent<T, MouseEvent>
) => void;

export type InputEventHandler<T extends HTMLElement = HTMLFormElement> = (
  event: React.FormEvent<T>
) => void;

export type DragEventHandler<T extends HTMLElement = HTMLElement> = (
  event: React.DragEvent<T>
) => void;
