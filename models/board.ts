import * as firebase from "firebase/app";

export abstract class BoardModel {
  abstract get id(): string;
}

export class FirebaseBoard extends BoardModel {
  private docRef: firebase.firestore.DocumentReference<
    firebase.firestore.DocumentData
  >;

  constructor(docRef) {
    super();
    this.docRef = docRef;
  }

  get id(): string {
    return this.docRef.id;
  }
}

interface CreateBoardOpts {
  title: string;
  sections: {
    title: string;
  }[];
}

export async function createBoard(opts: CreateBoardOpts): Promise<BoardModel> {
  const { title, sections } = opts;

  const db = firebase.firestore();

  const docRef = await db.collection("boards").add({
    title,
    sections,
  });

  return new FirebaseBoard(docRef);
}
