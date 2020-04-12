import * as React from "react";
import * as firebase from "firebase/app";

export interface BoardData {
  id: string;
  title: string;
  sections: {
    title: string;
  }[];
}

export interface CardData {
  id: string;
  sectionIndex: number;
  content: string;
  voteCount: number;
}

interface CreateBoardOpts {
  title: string;
  sections: {
    title: string;
  }[];
}

export async function createBoard(opts: CreateBoardOpts): Promise<string> {
  const { title, sections } = opts;

  const db = firebase.firestore();

  const docRef = await db.collection("boards").add({
    title,
    sections,
  });

  return docRef.id;
}

interface CreateCardOpts {
  content?: string;
}

export async function createCard(
  boardId: string,
  sectionIndex: number,
  opts: CreateCardOpts = {}
): Promise<string> {
  const { content = "" } = opts;

  const db = firebase.firestore();

  const docRef = await db
    .collection("boards")
    .doc(boardId)
    .collection("cards")
    .add({
      sectionIndex,
      content,
    });

  return docRef.id;
}

interface UpdateCardOpts {
  sectionIndex?: number;
  content?: string;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  opts: UpdateCardOpts = {}
): Promise<void> {
  const { sectionIndex, content } = opts;

  const db = firebase.firestore();

  const data: Partial<CardData> = {};

  if (typeof sectionIndex !== "undefined") {
    data.sectionIndex = sectionIndex;
  }

  if (typeof content !== "undefined") {
    data.content = content;
  }

  await db
    .collection("boards")
    .doc(boardId)
    .collection("cards")
    .doc(cardId)
    .update(data);
}

export async function deleteCard(
  boardId: string,
  cardId: string
): Promise<void> {
  const db = firebase.firestore();

  await db
    .collection("boards")
    .doc(boardId)
    .collection("cards")
    .doc(cardId)
    .delete();
}

export async function incrementVoteCard(
  boardId: string,
  cardId: string,
  value = 1
): Promise<void> {
  const db = firebase.firestore();

  await db
    .collection("boards")
    .doc(boardId)
    .collection("cards")
    .doc(cardId)
    .update({
      voteCount: firebase.firestore.FieldValue.increment(value),
    });
}

export function useBoard(boardId: string): BoardData {
  const [boardData, setBoardData] = React.useState<BoardData>(null);

  React.useEffect(() => {
    const db = firebase.firestore();

    const unsubscribe = db
      .collection("boards")
      .doc(boardId)
      .onSnapshot((doc) => {
        setBoardData({
          id: boardId,
          ...doc.data(),
        } as BoardData);
      });

    return unsubscribe;
  }, [boardId]);

  return boardData;
}

export function useBoardCards(boardId: string): CardData[] {
  const [cards, setCards] = React.useState<CardData[]>([]);

  React.useEffect(() => {
    const db = firebase.firestore();

    const unsubscribe = db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .onSnapshot((docs) => {
        const cards = [];

        docs.forEach((doc) => {
          cards.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setCards(cards);
      });

    return unsubscribe;
  }, [boardId]);

  return cards;
}
