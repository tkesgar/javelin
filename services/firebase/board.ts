import * as React from "react";
import firebase from "firebase/app";
import { createDebug } from "@/utils/log";

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

export interface Card {
  id: string;
  sectionId: string;
}

const debug = createDebug("firebase-board");

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
          debug("read board snapshot");
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
        debug("read board sections snapshot");
      });
  }, [boardId]);

  return sections;
}

export function useBoardCards(boardId: string): Record<string, Card[]> {
  const [sectionCards, setSectionCards] = React.useState<
    Record<string, Card[]>
  >({});

  React.useEffect(() => {
    if (!boardId) {
      return;
    }

    const unsubscribes: (() => void)[] = [
      db()
        .collection("boards")
        .doc(boardId)
        .collection("sections")
        .onSnapshot((querySectionSnapshot) => {
          querySectionSnapshot.forEach((sectionResult) => {
            unsubscribes.push(
              sectionResult.ref
                .collection("cards")
                .onSnapshot((queryCardSnapshot) => {
                  const newCards: Card[] = [];

                  queryCardSnapshot.forEach((cardResult) => {
                    newCards.push({
                      id: cardResult.id,
                      sectionId: sectionResult.id,
                    });
                  });

                  setSectionCards((oldSectionCards) => ({
                    ...oldSectionCards,
                    [sectionResult.id]: newCards,
                  }));
                  debug("read cards snapshot");
                })
            );
          });
          debug("read sections snapshot");
        }),
    ];

    return () => unsubscribes.forEach((fn) => fn());
  }, [boardId]);

  return sectionCards;
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
  debug("get my boards");

  return boards;
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
  debug("created board");

  return boardRef.id;
}

interface CreateCardData {
  boardId: string;
  sectionId: string;
}

export async function createCard({
  boardId,
  sectionId,
}: CreateCardData): Promise<string> {
  const ref = await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .add({});

  return ref.id;
}

export async function removeCard(
  boardId: string,
  sectionId: string,
  cardId: string
): Promise<void> {
  await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .doc(cardId)
    .delete();
}
