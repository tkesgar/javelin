import * as React from "react";
import firebase from "firebase/app";

interface CreateBoardData {
  title: string;
  description: string;
}

interface Board {
  id: string;
  title: string;
  description: string;
}

const db = () => firebase.firestore();

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
  const [board, setBoard] = React.useState<Board>(undefined);

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
