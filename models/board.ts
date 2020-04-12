import * as firebase from "firebase/app";

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
