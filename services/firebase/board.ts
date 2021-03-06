import firebase from "firebase/app";
import { createDebug } from "@/utils/log";
import * as React from "react";
import { Auth, useAuth } from "./auth";
import DOMPurify from "dompurify";

const db = () => firebase.firestore();
const debug = createDebug("firebase-board");

export const DEFAULT_TAG_COLOR = "#949494";
export interface Board {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  sectionCount: number;
  config: {
    showCardCreator: boolean;
    showTimestamp: boolean;
    removeCardOnlyOwner: boolean;
    markStaleMinutes: number;
  };
  labels: {
    key: string;
    color: string;
  }[];
}

export interface User {
  id: string;
  displayName: string;
  photoURL: string;
}

export interface Section {
  id: string;
  boardId: string;
  title: string;
}

export interface Card {
  id: string;
  boardId: string;
  sectionId: string;
  userId: string;
  content: string;
  timeCreated: number;
  timeUpdated: number;
}

const DEFAULT_BOARD_CONFIG: Board["config"] = {
  showCardCreator: true,
  showTimestamp: true,
  removeCardOnlyOwner: false,
  markStaleMinutes: 0,
};

const DEFAULT_BOARD_LABELS: Board["labels"] = [
  { key: "stale", color: DEFAULT_TAG_COLOR },
];

function toBoard({
  data,
  id,
}: {
  data: firebase.firestore.DocumentData;
  id: string;
}): Board {
  return {
    id,
    ownerId: data.ownerId,
    title: data.title,
    sectionCount: data.sectionCount,
    description: data.description || null,
    config: {
      ...DEFAULT_BOARD_CONFIG,
      ...(data.config || {}),
    },
    labels: data.labels || [...DEFAULT_BOARD_LABELS],
  };
}

function toSection({
  data,
  id,
  boardId,
}: {
  data: firebase.firestore.DocumentData;
  id: string;
  boardId: string;
}): Section {
  return {
    id,
    boardId,
    title: data.title,
  };
}

function toCard({
  data,
  id,
  boardId,
  sectionId,
}: {
  data: firebase.firestore.DocumentData;
  id: string;
  boardId: string;
  sectionId: string;
}): Card {
  return {
    id,
    boardId,
    sectionId,
    userId: data.userId,
    content: data.content,
    timeCreated: timestampToMiliseconds(data.timeCreated),
    timeUpdated: timestampToMiliseconds(data.timeUpdated),
  };
}

function toUser({
  data,
  id,
}: {
  data: firebase.firestore.DocumentData;
  id: string;
}): User {
  return {
    id,
    displayName: data.displayName,
    photoURL: data.photoURL,
  };
}

export async function getMyBoards(uid: string): Promise<Board[]> {
  const boards: Board[] = [];

  const querySnapshot = await db()
    .collection("boards")
    .where("ownerId", "==", uid)
    .get();

  querySnapshot.forEach((result) => {
    boards.push(
      toBoard({
        id: result.id,
        data: result.data(),
      })
    );
  });
  debug("get my boards");

  return boards;
}

export async function createBoard({
  userId,
  title,
  sectionTitles,
  description = null,
  config = {},
  labels = [...DEFAULT_BOARD_LABELS],
}: {
  userId: string;
  title: Board["title"];
  sectionTitles: string[];
  description?: Board["description"];
  config?: Partial<Board["config"]>;
  labels?: Board["labels"];
}): Promise<string> {
  const batch = db().batch();

  const boardRef = db().collection("boards").doc();
  batch.set(boardRef, {
    title,
    ownerId: userId,
    sectionCount: sectionTitles.length,
    description,
    config: {
      ...DEFAULT_BOARD_CONFIG,
      ...config,
    },
    labels,
  });

  for (const [i, title] of sectionTitles.entries()) {
    const sectionRef = boardRef.collection("sections").doc(`section${i + 1}`);
    batch.set(sectionRef, { title });
  }

  await batch.commit();
  debug("created board");

  return boardRef.id;
}

export async function updateBoard({
  id,
  title,
  description,
  config,
  labels,
}: {
  id: string;
  title?: Board["title"];
  description?: Board["description"];
  config?: Board["config"];
  labels?: Board["labels"];
}): Promise<void> {
  await db()
    .collection("boards")
    .doc(id)
    .update(pick({ title, description, config, labels }));
  debug("updated board");
}

export async function createCard({
  auth,
  boardId,
  sectionId,
  content = "",
}: {
  auth: Auth;
  boardId: string;
  sectionId: string;
  userId: string;
  content?: string;
}): Promise<void> {
  await db()
    .batch()
    .set(
      db()
        .collection("boards")
        .doc(boardId)
        .collection("sections")
        .doc(sectionId)
        .collection("cards")
        .doc(),
      {
        userId: auth.uid,
        content,
        timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
        timeUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      }
    )
    .set(
      db().collection("boards").doc(boardId).collection("users").doc(auth.uid),
      {
        displayName: auth.displayName,
        photoURL: auth.photoURL,
      }
    )
    .commit();
  debug("created card");
}

export async function updateCard({
  boardId,
  sectionId,
  cardId,
  content,
}: {
  boardId: string;
  sectionId: string;
  cardId: string;
  content?: string;
}): Promise<void> {
  await db()
    .collection("boards")
    .doc(boardId)
    .collection("sections")
    .doc(sectionId)
    .collection("cards")
    .doc(cardId)
    .update({
      ...pick({
        content: DOMPurify.sanitize(content, {
          ALLOWED_TAGS: [],
        }),
      }),
      timeUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });
  debug("updated card");
}

export async function removeCard({
  boardId,
  sectionId,
  cardId,
}: {
  boardId: string;
  sectionId: string;
  cardId: string;
}): Promise<void> {
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

export async function moveCard({
  boardId,
  cardId,
  sectionIdFrom: sectionId,
  sectionIdTo: newSectionId,
}: {
  boardId: string;
  cardId: string;
  sectionIdFrom: string;
  sectionIdTo: string;
}): Promise<void> {
  const cardData = (
    await db()
      .collection("boards")
      .doc(boardId)
      .collection("sections")
      .doc(sectionId)
      .collection("cards")
      .doc(cardId)
      .get()
  ).data();

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
  debug("move card");
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
          setBoard(
            toBoard({
              id: snapshot.id,
              data: snapshot.data(),
            })
          );
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
          newSections.push(
            toSection({
              id: result.id,
              data: result.data(),
              boardId,
            })
          );
        });

        setSections(newSections);
        debug("read board sections snapshot");
      });
  }, [boardId]);

  return sections;
}

export function useBoardUsers(boardId: string | false): User[] {
  const auth = useAuth();
  const [users, setUsers] = React.useState<User[]>();

  React.useEffect(() => {
    if (!auth || !boardId) {
      return;
    }

    return db()
      .collection("boards")
      .doc(boardId)
      .collection("users")
      .onSnapshot((querySnapshot) => {
        const newUsers: typeof users = [];

        querySnapshot.forEach((result) => {
          newUsers.push(
            toUser({
              data: result.data(),
              id: result.id,
            })
          );
        });

        setUsers(newUsers);
        debug("read board users snapshot");
      });
  }, [auth, boardId]);

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

    const unsubscribes = [
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
                    newCards.push(
                      toCard({
                        data: cardResult.data(),
                        id: cardResult.id,
                        boardId: boardId,
                        sectionId: sectionResult.id,
                      })
                    );
                  });

                  setSectionCards((oldSectionCards) => ({
                    ...oldSectionCards,
                    [sectionResult.id]: newCards,
                  }));
                  debug("read section cards snapshot");
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

function pick(objIn: Record<string, unknown>): Record<string, unknown> {
  const objOut = {};

  for (const [key, value] of Object.entries(objIn)) {
    if (typeof value === "undefined") {
      continue;
    }
    objOut[key] = value;
  }

  return objOut;
}

function timestampToMiliseconds(timestamp: {
  seconds: number;
  nanoseconds: number;
}): number {
  // Timestamps can be null if data is from cache.
  // Here we use an approximation Date.now(), since it is
  // probably the state when the card is first created.
  if (!timestamp) {
    return Date.now();
  }

  const { seconds, nanoseconds } = timestamp;
  return seconds * 1000 + Math.trunc(nanoseconds / 1000000);
}
