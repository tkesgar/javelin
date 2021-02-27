import * as React from "react";
import firebase from "firebase/app";

const db = () => firebase.firestore();

export interface Board {
  id: string;
  title: string;
  description: string;
  sectionCount: number;
}

export interface Section {
  id: string;
  title: string;
}

interface CreateBoardData {
  title: string;
  description: string;
  sectionTitles: string[];
}

export async function createBoard(
  uid: string,
  data: CreateBoardData
): Promise<string> {
  const { title, description, sectionTitles } = data;

  const batch = db().batch();

  const boardRef = db().collection("boards").doc();
  batch.set(boardRef, {
    title,
    description,
    ownerId: uid,
    sectionCount: sectionTitles.length,
  });

  for (const [i, title] of sectionTitles.entries()) {
    const sectionRef = boardRef.collection("sections").doc(`section${i + 1}`);
    batch.set(sectionRef, { title });
  }

  await batch.commit();

  return boardRef.id;
}

export function useBoard(boardId: string): Board {
  const [board, setBoard] = React.useState<Board>();

  React.useEffect(() => {
    if (!boardId) {
      return;
    }

    return db()
      .collection("boards")
      .doc(boardId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data();
          setBoard({
            id: snapshot.id,
            title: data.title,
            description: data.description,
            sectionCount: data.sectionCount,
          });
        } else {
          setBoard(null);
        }
      });
  }, [boardId]);

  return board;
}

export function useBoardSections(boardId: string): Section[] {
  const [sections, setSections] = React.useState<Section[]>();

  React.useEffect(() => {
    if (!boardId) {
      return;
    }

    return db()
      .collection("boards")
      .doc(boardId)
      .collection("sections")
      .onSnapshot((querySnapshot) => {
        const newSections: typeof sections = [];

        querySnapshot.forEach((result) => {
          const data = result.data();
          newSections.push({
            id: result.id,
            title: data.title,
          });
        });

        setSections(newSections);
      });
  });

  return sections;
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
      sectionCount: data.sectionCount,
    });
  });

  return boards;
}
