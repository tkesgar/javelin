import firebase from "firebase/app";

interface CreateBoardData {
  title: string;
  description: string;
}

export async function createBoard(data: CreateBoardData): Promise<string> {
  const { title, description } = data;

  const ref = await firebase.firestore().collection("boards").add({
    title,
    description,
  });

  return ref.id;
}
