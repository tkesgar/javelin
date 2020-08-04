import axios from "axios";
import useSWR from "swr";

export interface BoardData {
  id: number;
  slug: string;
  title: string;
  sections: {
    id: number;
    title: string;
  }[];
}

export interface CardData {
  id: number;
  sectionId: number;
  content: string;
  vote: number;
}

interface CreateBoardOpts {
  title: string;
  sections: {
    title: string;
  }[];
}

export async function createBoard(opts: CreateBoardOpts): Promise<string> {
  const { title, sections } = opts;

  const sectionTitles = sections.map((section) => section.title);

  const response = await axios.post("/api/board", {
    title,
    sectionTitles,
  });

  return response.data.slug;
}

export async function removeBoard(slug: string): Promise<void> {
  await axios.delete(`/api/board/${slug}`);
}

interface CreateCardOpts {
  content?: string;
}

export async function createCard(
  sectionId: number,
  opts: CreateCardOpts = {}
): Promise<CardData> {
  const { content } = opts;

  const response = await axios.post(`/api/card`, {
    sectionId,
    content,
  });

  return response.data;
}

interface UpdateCardOpts {
  sectionId?: number;
  content?: string;
}

export async function updateCard(
  cardId: number,
  opts: UpdateCardOpts = {}
): Promise<CardData> {
  const { sectionId, content } = opts;

  const response = await axios.patch(`/api/card/${cardId}`, {
    sectionId,
    content,
  });

  return response.data;
}

export async function deleteCard(cardId: number): Promise<void> {
  await axios.delete(`/api/card/${cardId}`);
}

export async function incrementVoteCard(
  cardId: number,
  value = 1
): Promise<CardData> {
  const response = await axios.post(`/api/card/${cardId}/vote`, {
    amount: value,
  });
  return response.data;
}

export function useBoard(boardSlug: string): BoardData {
  const { data: response } = useSWR(`/api/board/${boardSlug}`, axios);

  if (!response) {
    return null;
  }

  const boardData = {
    id: response.data.id,
    slug: response.data.slug,
    title: response.data.title,
    sections: response.data.sections,
  };

  return boardData;
}

export function useBoardCards(boardSlug: string): CardData[] {
  const { data: response } = useSWR(`/api/board/${boardSlug}/card`, axios);

  if (!response) {
    return [];
  }

  return response.data.map((data) => {
    return {
      id: data.id,
      sectionId: data.sectionId,
      content: data.content,
      vote: data.vote,
    };
  });
}
