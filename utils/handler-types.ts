export type OnSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

export type OnChangeHandler = (
  event: React.FormEvent<HTMLInputElement>
) => void;

export type OnClickHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => void;

export type OnInputHandler = (event: React.FormEvent<HTMLDivElement>) => void;
