import * as React from "react";
import { Container } from "react-bootstrap";
import * as BoardModel from "../../models/board";
import Footer from "../Footer";
import BoardView from "../BoardView";

interface BoardPageProps {
  boardId: string;
}

export default function BoardPage({ boardId }: BoardPageProps): JSX.Element {
  const board = BoardModel.useBoard(boardId);

  if (!board) {
    return null;
  }

  return (
    <>
      <Container className="my-5">
        <h1 className="text-center mb-5">{board.title}</h1>
        <BoardView board={board} />
      </Container>
      <div className="mt-5 py-4 border-top border-secondary">
        <Footer />
      </div>
    </>
  );
}
