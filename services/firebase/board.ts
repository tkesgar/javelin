import * as React from "react";
import firebase from "firebase/app";

interface CreateBoardData {
  title: string;
  description: string;
}

const db = () => firebase.firestore();

export interface Board {
  id: string;
  title: string;
  description: string;
}

export async function createBoard(
  uid: string,
  data: CreateBoardData
): Promise<string> {
  const { title, description } = data;

  const ref = await db().collection("boards").add({
    title,
    description,
    ownerId: uid,
  });

  return ref.id;
}

export function useBoard(id: string): Board {
  const [board, setBoard] = React.useState<Board>();

  React.useEffect(() => {
    if (!id) {
      return;
    }

    return db()
      .collection("boards")
      .doc(id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setBoard(doc.data() as Board);
        } else {
          setBoard(null);
        }
      });
  }, [id]);

  return board;
}

export async function getMyBoards(uid: string): Promise<Board[]> {
  const boards: Board[] = [];

  const querySnapshot = await db()
    .collection("boards")
    .where("ownerId", "==", uid)
    .get();

  querySnapshot.forEach((result) => {
    const data = result.data();
    boards.push({
      id: result.id,
      description: data.description,
      title: data.title,
    });
  });

  return boards;
}
