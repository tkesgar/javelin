import * as React from "react";
import firebase from "firebase/app";
import { createDebug } from "@/utils/log";
import { Auth } from "./auth";

const db = () => firebase.firestore();

export interface Board {
  id: string;
  title: string;
  description: string;
  sectionCount: number;
}

export interface User {
  id: string;
  displayName: string;
  photoURL: string;
}

export interface Section {
  id: string;
  title: string;
}

export interface Card {
  id: string;
  userId: string;
  content: string;
  timeCreated: number;
  timeUpdated: number;
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

export function useBoardUsers(boardId: string): User[] {
  const [users, setUsers] = React.useState<User[]>();

  React.useEffect(() => {
    if (!boardId) {
      return;
    }

    return db()
      .collection("boards")
      .doc(boardId)
      .collection("users")
      .onSnapshot((querySnapshot) => {
        const newUsers: typeof users = [];

        querySnapshot.forEach((result) => {
          const data = result.data();
          newUsers.push({
            id: result.id,
            displayName: data.displayName,
            photoURL: data.photoURL,
          });
        });

        setUsers(newUsers);
        debug("read board users snapshot");
      });
  }, [boardId]);

  return users;
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
                    const data = cardResult.data();

                    // Timestamps can be null if data is from cache.
                    // Here we use an approximation Date.now(), since it is
                    // probably the state when the card is first created.
                    const timeCreated = data.timeCreated
                      ? timestampToMiliseconds(data.timeCreated)
                      : Date.now();
                    const timeUpdated = data.timeUpdated
                      ? timestampToMiliseconds(data.timeUpdated)
                      : Date.now();

                    newCards.push({
                      id: cardResult.id,
                      userId: data.userId,
                      content: data.content,
                      timeCreated,
                      timeUpdated,
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
  userId: string,
  data: CreateBoardData
): Promise<string> {
  const { title, description, sectionTitles } = data;

  const batch = db().batch();

  const boardRef = db().collection("boards").doc();
  batch.set(boardRef, {
    title,
    description,
    ownerId: userId,
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

interface UpdateBoardData {
  title: string;
  description: string;
}

export async function updateBoard(
  id: string,
  { title, description }: UpdateBoardData
): Promise<void> {
  await db().collection("boards").doc(id).update({
    title,
    description,
  });
  debug("updated board");
}

interface CreateCardData {
  boardId: string;
  sectionId: string;
  userId: string;
}

export async function createCard({
  boardId,
  sectionId,
  userId,
}: CreateCardData): Promise<string> {
  const ref = await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .add({
      userId,
      content: "",
      timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
      timeUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });
  debug("created card");

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
  debug("removed card");
}

interface UpdateCardData {
  boardId: string;
  sectionId: string;
  cardId: string;
  content: string;
}

export async function updateCard(data: UpdateCardData): Promise<void> {
  const { boardId, sectionId, cardId, content } = data;

  await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .doc(cardId)
    .update({
      content,
      timeUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });
  debug("updated card");
}

interface UpdateCardSectionData {
  boardId: string;
  sectionId: string;
  cardId: string;
  newSectionId: string;
}

export async function updateCardSection(
  data: UpdateCardSectionData
): Promise<void> {
  const { boardId, sectionId, cardId, newSectionId } = data;

  const cardSnapshot = await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .doc(cardId)
    .get();
  const cardData = cardSnapshot.data();

  const batch = db().batch();

  const oldCardRef = db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .doc(cardId);
  batch.delete(oldCardRef);

  const newCardRef = db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(newSectionId)
    .collection("cards")
    .doc(cardId);
  batch.set(newCardRef, {
    content: cardData.content,
    timeCreated: cardData.timeCreated,
    timeUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    userId: cardData.userId,
  });

  await batch.commit();
  debug("updated card section");
}

export async function updateBoardUserFromAuth(
  boardId: string,
  auth: Auth
): Promise<void> {
  await db()
    .collection("boards")
    .doc(boardId)
    .collection("users")
    .doc(auth.uid)
    .set({
      displayName: auth.displayName,
      photoURL: auth.photoURL,
    });
  debug("update board user from auth");
}

function timestampToMiliseconds(timestamp: {
  seconds: number;
  nanoseconds: number;
}): number {
  const { seconds, nanoseconds } = timestamp;

  return seconds * 1000 + Math.trunc(nanoseconds / 1000000);
}
